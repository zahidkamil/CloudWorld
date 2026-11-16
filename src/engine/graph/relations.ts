import type { CloudResource, GraphEdge, InfrastructureGraph } from './types';

export interface Relation {
  resource: CloudResource;
  kind: GraphEdge['kind'];
  via?: string;
}

export interface Relationships {
  dependsOn: Relation[];
  usedBy: Relation[];
  variables: string[];
  /** Other consumers of the same shared component, keyed by the component id. */
  peers: { groupId: string; kind: string; others: CloudResource[] }[];
}

/** Direct relationships of one resource, for the inspector. */
export function relationshipsOf(graph: InfrastructureGraph, id: string): Relationships {
  const byId = new Map(graph.resources.map((r) => [r.id, r]));
  const toRelation = (e: GraphEdge, otherId: string): Relation | undefined => {
    const resource = byId.get(otherId);
    return resource ? { resource, kind: e.kind, via: e.via } : undefined;
  };
  const dependsOn: Relation[] = [];
  const usedBy: Relation[] = [];
  const variables = new Set<string>();
  for (const e of graph.edges) {
    if (e.from === id) {
      if (e.kind === 'variable') variables.add(e.to);
      else {
        const rel = toRelation(e, e.to);
        if (rel) dependsOn.push(rel);
      }
    } else if (e.to === id) {
      const rel = toRelation(e, e.from);
      if (rel) usedBy.push(rel);
    }
  }
  const peers = graph.groups
    .filter((g) => g.consumers.includes(id))
    .map((g) => ({
      groupId: g.id,
      kind: g.kind,
      others: g.consumers.filter((c) => c !== id).flatMap((c) => byId.get(c) ?? []),
    }));
  return { dependsOn, usedBy, variables: [...variables].sort(), peers };
}
