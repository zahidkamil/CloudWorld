import type { CloudResource, GraphEdge, SharedGroup, SharedGroupKind } from './types';

const KIND_BY_TYPE: Record<string, SharedGroupKind> = {
  aws_security_group: 'security-group',
  aws_subnet: 'subnet',
  aws_iam_role: 'iam-role',
  aws_lb_target_group: 'target-group',
  aws_kms_key: 'kms-key',
};

/** Shared components (and Terraform variables) with two or more consumers, for peer highlighting. */
export function buildGroups(resources: CloudResource[], edges: GraphEdge[]): SharedGroup[] {
  const typeById = new Map(resources.map((r) => [r.id, r.type]));
  const consumers = new Map<string, { kind: SharedGroupKind; set: Set<string> }>();
  for (const edge of edges) {
    const kind = edge.kind === 'variable' ? 'variable' : KIND_BY_TYPE[typeById.get(edge.to) ?? ''];
    if (!kind) continue;
    const entry = consumers.get(edge.to) ?? { kind, set: new Set<string>() };
    entry.set.add(edge.from);
    consumers.set(edge.to, entry);
  }
  return [...consumers.entries()]
    .filter(([, v]) => v.set.size >= 2)
    .map(([id, v]) => ({ id, kind: v.kind, consumers: [...v.set].sort() }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
