import type { ResourceCategory } from '@/engine/registry/registry';
import type { CloudResource, InfrastructureGraph } from './types';

export interface TypeGroup {
  type: string;
  label: string;
  resources: CloudResource[];
}

export interface CategoryGroup {
  category: ResourceCategory;
  label: string;
  count: number;
  types: TypeGroup[];
}

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  network: 'Networking',
  compute: 'Compute',
  containers: 'Containers',
  serverless: 'Serverless',
  storage: 'Storage',
  database: 'Database',
  security: 'Security and identity',
  integration: 'Messaging and integration',
  edge: 'Edge and DNS',
  monitoring: 'Monitoring and logs',
  other: 'Other AWS resources',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as ResourceCategory[];

/**
 * Category -> resource type -> instances. Pure and deterministic: categories follow a fixed order,
 * types and instances are sorted by label and address. The 3D legend (Task 4) reuses this.
 */
export function groupByType(graph: Pick<InfrastructureGraph, 'resources'>): CategoryGroup[] {
  const byCategory = new Map<ResourceCategory, Map<string, TypeGroup>>();
  for (const r of graph.resources) {
    const types = byCategory.get(r.category) ?? new Map<string, TypeGroup>();
    const group = types.get(r.type) ?? { type: r.type, label: r.label, resources: [] };
    group.resources.push(r);
    types.set(r.type, group);
    byCategory.set(r.category, types);
  }
  return CATEGORY_ORDER.flatMap((category) => {
    const types = byCategory.get(category);
    if (!types) return [];
    const sorted = [...types.values()]
      .map((t) => ({ ...t, resources: [...t.resources].sort((a, b) => a.id.localeCompare(b.id)) }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return [
      {
        category,
        label: CATEGORY_LABELS[category],
        count: sorted.reduce((n, t) => n + t.resources.length, 0),
        types: sorted,
      },
    ];
  });
}
