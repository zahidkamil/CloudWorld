import { lookupRegistry } from '@/engine/registry/registry';
import type { GraphEdge, Placement } from '@/engine/graph/types';
import type { ParsedPlan, PlanResource } from '@/engine/terraform/types';

const REGION = /^[a-z]{2}(?:-[a-z]+)+-\d+$/;
const AZ = /^([a-z]{2}(?:-[a-z]+)+-\d+)[a-z]$/;
const ARN_REGION = /^arn:aws[a-z-]*:[^:]*:([a-z]{2}(?:-[a-z]+)+-\d+):/;
const PARENT_KINDS = new Set<GraphEdge['kind']>(['contains', 'network', 'attached']);

const str = (v: unknown) => (typeof v === 'string' ? v : undefined);

function arnRegion(values: Record<string, unknown>): string | undefined {
  for (const key of ['arn', 'target_group_arn', 'role', 'kms_key_id']) {
    const match = ARN_REGION.exec(str(values[key]) ?? '');
    if (match) return match[1];
  }
  return undefined;
}

function providerRegion(plan: ParsedPlan, r: PlanResource): string | undefined {
  const key = r.providerConfigKey;
  if (!key) return undefined;
  const direct = plan.providers[key] ?? plan.providers[key.slice(key.lastIndexOf(':') + 1)];
  return direct?.region && REGION.test(direct.region) ? direct.region : undefined;
}

/**
 * Decides where each resource lives (R3.1). Order: region/AZ attribute, parent relationship,
 * provider region, ARN, else unresolved. Each decision records its source.
 */
export function resolveTopology(plan: ParsedPlan, edges: GraphEdge[]): Map<string, Placement> {
  const placements = new Map<string, Placement>();
  const byId = new Map(plan.resources.map((r) => [r.address, r]));
  const parents = new Map<string, string[]>();
  for (const e of edges) {
    if (!PARENT_KINDS.has(e.kind) || !byId.has(e.to)) continue;
    const list = parents.get(e.from) ?? [];
    list.push(e.to);
    parents.set(e.from, list);
  }

  const zonal = (r: PlanResource) => lookupRegistry(r.type).scope === 'zonal';
  const pending: PlanResource[] = [];
  for (const r of plan.resources) {
    if (lookupRegistry(r.type).scope === 'global') {
      placements.set(r.address, { scope: 'global', source: 'global service' });
    } else {
      pending.push(r);
    }
  }

  const byAttribute = (r: PlanResource): Placement | undefined => {
    const az = str(r.values.availability_zone);
    const azMatch = az ? AZ.exec(az) : null;
    if (azMatch) {
      return zonal(r)
        ? { scope: 'az', region: azMatch[1], az, source: 'availability_zone attribute' }
        : { scope: 'region', region: azMatch[1], azs: [az!], source: 'availability_zone attribute' };
    }
    const region = str(r.values.region);
    if (region && REGION.test(region)) return { scope: 'region', region, source: 'region attribute' };
    return undefined;
  };

  const byParent = (r: PlanResource): Placement | undefined => {
    const resolved = (parents.get(r.address) ?? [])
      .map((id) => ({ id, p: placements.get(id) }))
      .filter((x): x is { id: string; p: Placement } => !!x.p && !!x.p.region);
    if (resolved.length === 0) return undefined;
    const counts = new Map<string, number>();
    for (const { p } of resolved) counts.set(p.region!, (counts.get(p.region!) ?? 0) + 1);
    const region = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]![0];
    const inRegion = resolved.filter((x) => x.p.region === region);
    const sourceType = byId.get(inRegion[0]!.id)!.type.replace(/^aws_/, '');
    if (zonal(r)) {
      const azs = new Set(
        inRegion.filter((x) => byId.get(x.id)?.type === 'aws_subnet' && x.p.az).map((x) => x.p.az!),
      );
      if (azs.size === 1) {
        return { scope: 'az', region, az: [...azs][0], source: 'parent subnet' };
      }
    }
    return { scope: 'region', region, source: `parent ${sourceType}` };
  };

  const resolvePass = (methods: ((r: PlanResource) => Placement | undefined)[]) => {
    let changed = true;
    while (changed) {
      changed = false;
      for (const r of pending) {
        if (placements.has(r.address)) continue;
        for (const method of methods) {
          const found = method(r);
          if (found) {
            placements.set(r.address, found);
            changed = true;
            break;
          }
        }
      }
    }
  };

  resolvePass([byAttribute, byParent]);
  resolvePass([
    (r) => {
      const region = providerRegion(plan, r);
      return region ? { scope: 'region', region, source: 'provider region' } : undefined;
    },
    (r) => {
      const region = arnRegion(r.values);
      return region ? { scope: 'region', region, source: 'ARN' } : undefined;
    },
  ]);
  // Provider/ARN placements can unlock parents for resources that were still waiting.
  resolvePass([byParent]);

  for (const r of pending) {
    if (!placements.has(r.address)) {
      placements.set(r.address, { scope: 'unresolved', source: 'no region information' });
    }
  }

  linkAvailabilityZones(placements, edges);
  return placements;
}

/** Region-level resources that use subnets (directly or via a subnet group) link to those zones (R3.3). */
function linkAvailabilityZones(placements: Map<string, Placement>, edges: GraphEdge[]) {
  const targets = new Map<string, string[]>();
  for (const e of edges) {
    if (!PARENT_KINDS.has(e.kind)) continue;
    const list = targets.get(e.from) ?? [];
    list.push(e.to);
    targets.set(e.from, list);
  }
  for (let pass = 0; pass < 4; pass++) {
    let changed = false;
    for (const [id, p] of placements) {
      if (p.scope !== 'region') continue;
      const azs = new Set(p.azs ?? []);
      for (const t of targets.get(id) ?? []) {
        const tp = placements.get(t);
        if (!tp || tp.region !== p.region) continue;
        if (tp.az) azs.add(tp.az);
        for (const az of tp.azs ?? []) azs.add(az);
      }
      if (azs.size > (p.azs?.length ?? 0)) {
        placements.set(id, { ...p, azs: [...azs].sort() });
        changed = true;
      }
    }
    if (!changed) break;
  }
}
