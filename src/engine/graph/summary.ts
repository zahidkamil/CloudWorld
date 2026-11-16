import type { InfrastructureGraph, RegionInfo } from './types';

export interface GraphSummary {
  total: number;
  global: number;
  unresolved: number;
  regions: RegionInfo[];
  byLabel: { label: string; count: number }[];
  warnings: string[];
}

/** Counts shown in the import preview. */
export function summarizeGraph(graph: InfrastructureGraph): GraphSummary {
  const labels = new Map<string, number>();
  for (const r of graph.resources) labels.set(r.label, (labels.get(r.label) ?? 0) + 1);
  return {
    total: graph.resources.length,
    global: graph.resources.filter((r) => r.placement.scope === 'global').length,
    unresolved: graph.resources.filter((r) => r.placement.scope === 'unresolved').length,
    regions: graph.regions,
    byLabel: [...labels.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    warnings: graph.warnings,
  };
}
