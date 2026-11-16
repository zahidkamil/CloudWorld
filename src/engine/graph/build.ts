import { lookupRegistry } from '@/engine/registry/registry';
import { resolveTopology } from '@/engine/topology/resolve';
import { PERFORMANCE_WARNING_RESOURCES, type ParsedPlan, type PlanResource } from '@/engine/terraform/types';
import { extractEdges } from './edges';
import { buildGroups } from './groups';
import type { CloudResource, InfrastructureGraph, RegionInfo } from './types';

function displayName(r: PlanResource): string {
  for (const key of ['tags', 'tags_all']) {
    const tags = r.values[key];
    if (typeof tags === 'object' && tags !== null) {
      const name = (tags as Record<string, unknown>).Name;
      if (typeof name === 'string' && name) return name;
    }
  }
  return r.index === undefined ? r.name : `${r.name}[${r.index}]`;
}

function safeAttributes(r: PlanResource, allow: readonly string[]): CloudResource['attributes'] {
  const out: CloudResource['attributes'] = {};
  for (const key of allow) {
    const v = r.values[key];
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') out[key] = v;
  }
  return out;
}

/** Converts a parsed plan to the renderer-independent graph. The parsed plan can then be discarded. */
export function buildGraph(plan: ParsedPlan): InfrastructureGraph {
  const edges = extractEdges(plan);
  const placements = resolveTopology(plan, edges);
  const warnings = [...plan.warnings];

  const resources: CloudResource[] = plan.resources.map((r) => {
    const entry = lookupRegistry(r.type);
    return {
      id: r.address,
      type: r.type,
      name: displayName(r),
      label: entry.label,
      module: r.module,
      index: r.index,
      category: entry.category,
      placement: placements.get(r.address) ?? { scope: 'unresolved', source: 'no region information' },
      attributes: safeAttributes(r, entry.attributes),
      action: r.action,
    };
  });

  const regionMap = new Map<string, { azs: Set<string>; count: number }>();
  for (const r of resources) {
    const { region, az, azs } = r.placement;
    if (!region) continue;
    const info = regionMap.get(region) ?? { azs: new Set<string>(), count: 0 };
    info.count += 1;
    if (az) info.azs.add(az);
    for (const x of azs ?? []) info.azs.add(x);
    regionMap.set(region, info);
  }
  const regions: RegionInfo[] = [...regionMap.entries()]
    .map(([name, v]) => ({ name, azs: [...v.azs].sort(), resourceCount: v.count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const unresolved = resources.filter((r) => r.placement.scope === 'unresolved').length;
  if (unresolved > 0) {
    warnings.push(`${unresolved} resource${unresolved === 1 ? '' : 's'} could not be placed in a region.`);
  }
  if (resources.length === 0) warnings.push('No AWS resources were found in this plan.');
  if (resources.length > PERFORMANCE_WARNING_RESOURCES) {
    warnings.push(
      `This plan has ${resources.length} resources. Rendering may be slow above ${PERFORMANCE_WARNING_RESOURCES}.`,
    );
  }

  return { resources, edges, groups: buildGroups(resources, edges), regions, warnings };
}
