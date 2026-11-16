import type { ConfigModule, ParsedPlan, PlanResource } from '@/engine/terraform/types';
import type { GraphEdge } from './types';

const stripIndexes = (s: string) => s.replace(/\[[^\]]*\]/g, '');
const SKIP_ROOTS = new Set(['local', 'each', 'count', 'path', 'self', 'terraform', 'data']);

const CONTAINS = new Set([
  'vpc_id',
  'subnet_id',
  'subnet_ids',
  'subnets',
  'vpc_zone_identifier',
  'db_subnet_group_name',
]);
const NETWORK = new Set([
  'security_groups',
  'security_group_ids',
  'vpc_security_group_ids',
  'security_group_id',
  'route_table_id',
  'gateway_id',
  'nat_gateway_id',
  'internet_gateway_id',
]);
const ATTACHED = new Set([
  'target_id',
  'target_group_arn',
  'allocation_id',
  'instance_id',
  'network_interface_id',
  'load_balancer_arn',
]);

export function edgeKindFor(field: string): GraphEdge['kind'] {
  if (CONTAINS.has(field)) return 'contains';
  if (NETWORK.has(field)) return 'network';
  if (ATTACHED.has(field)) return 'attached';
  return 'references';
}

type Target = { kind: 'resource'; base: string } | { kind: 'variable'; name: string };

const parentPath = (path: string) => {
  const i = path.lastIndexOf('.module.');
  return i >= 0 ? path.slice(0, i) : '';
};

/** Resolves one Terraform reference string, as written inside `modulePath`, to resources or root variables. */
function resolveReference(
  ref: string,
  modulePath: string,
  modules: Map<string, ConfigModule>,
  depth = 0,
): Target[] {
  if (depth > 8) return [];
  const segs = stripIndexes(ref).split('.');
  const root = segs[0];
  if (!root || SKIP_ROOTS.has(root)) return [];
  const prefix = modulePath ? `${modulePath}.` : '';

  if (root === 'var' && segs[1]) {
    if (!modulePath) return [{ kind: 'variable', name: segs[1] }];
    const input = modules.get(modulePath)?.inputs[segs[1]] ?? [];
    return input.flatMap((r) => resolveReference(r, parentPath(modulePath), modules, depth + 1));
  }
  if (root === 'module' && segs[1] && segs[2]) {
    const childPath = `${prefix}module.${segs[1]}`;
    const outputRefs = modules.get(childPath)?.outputs[segs[2]] ?? [];
    return outputRefs.flatMap((r) => resolveReference(r, childPath, modules, depth + 1));
  }
  if (root.startsWith('aws_') && segs[1]) {
    return [{ kind: 'resource', base: `${prefix}${root}.${segs[1]}` }];
  }
  return [];
}

/** Values that are known at plan time (existing resources) let us match raw ids and ARNs. */
function scanKnownIds(
  values: unknown,
  field: string,
  depth: number,
  visit: (field: string, s: string) => void,
) {
  if (depth > 4) return;
  if (typeof values === 'string') visit(field, values);
  else if (Array.isArray(values)) for (const v of values) scanKnownIds(v, field, depth + 1, visit);
  else if (typeof values === 'object' && values !== null) {
    for (const [k, v] of Object.entries(values)) scanKnownIds(v, k, depth + 1, visit);
  }
}

export function extractEdges(plan: ParsedPlan): GraphEdge[] {
  const modules = new Map(plan.modules.map((m) => [m.path, m]));
  const configByBase = new Map(plan.configResources.map((c) => [c.base, c]));
  const instancesByBase = new Map<string, PlanResource[]>();
  for (const r of plan.resources) {
    const base = stripIndexes(r.address);
    const list = instancesByBase.get(base);
    if (list) list.push(r);
    else instancesByBase.set(base, [r]);
  }

  const edges = new Map<string, GraphEdge>();
  const add = (edge: GraphEdge) => {
    if (edge.from === edge.to) return;
    edges.set(`${edge.from}|${edge.to}|${edge.kind}|${edge.via ?? ''}`, edge);
  };

  for (const source of plan.resources) {
    const cfg = configByBase.get(stripIndexes(source.address));
    if (!cfg) continue;
    for (const { field, references } of cfg.expressions) {
      const kind = edgeKindFor(field);
      const aligned = references.includes('count.index') && typeof source.index === 'number';
      for (const ref of references) {
        for (const target of resolveReference(ref, cfg.modulePath, modules)) {
          if (target.kind === 'variable') {
            add({ from: source.address, to: `var.${target.name}`, kind: 'variable', via: field });
            continue;
          }
          const candidates = instancesByBase.get(target.base) ?? [];
          const matched =
            aligned && candidates.some((t) => t.index === source.index)
              ? candidates.filter((t) => t.index === source.index)
              : candidates;
          for (const t of matched) add({ from: source.address, to: t.address, kind, via: field });
        }
      }
    }
  }

  const byKnownId = new Map<string, string>();
  for (const r of plan.resources) {
    for (const key of ['id', 'arn']) {
      const v = r.values[key];
      if (typeof v === 'string' && v && !byKnownId.has(v)) byKnownId.set(v, r.address);
    }
  }
  if (byKnownId.size > 0) {
    for (const r of plan.resources) {
      scanKnownIds(r.values, '', 0, (field, s) => {
        const target = byKnownId.get(s);
        if (target && field !== 'id' && field !== 'arn') {
          add({ from: r.address, to: target, kind: edgeKindFor(field), via: field });
        }
      });
    }
  }

  return [...edges.values()];
}
