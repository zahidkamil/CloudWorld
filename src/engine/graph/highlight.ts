import { relationshipsOf } from './relations';
import type { InfrastructureGraph } from './types';

/**
 * How one resource should look while another is selected or hovered.
 * primary = the selection, dependency = directly connected, peer = shares a security group, subnet,
 * IAM role, target group, KMS key or variable with it, hover = under the pointer, dim = everything else.
 */
export type HighlightState = 'primary' | 'type' | 'dependency' | 'peer' | 'hover' | 'dim' | 'none';

export interface HighlightLink {
  from: string;
  to: string;
  kind: 'dependency' | 'peer';
}

export interface Highlights {
  states: Map<string, HighlightState>;
  /** Lines to draw from the selection to what it depends on or is used by. */
  links: HighlightLink[];
}

export const NO_HIGHLIGHTS: Highlights = { states: new Map(), links: [] };

/** Pure: reads the graph, never changes it. Theme and camera never affect the result. */
export function computeHighlights(
  graph: InfrastructureGraph,
  selectedId: string | null,
  hoveredId: string | null,
  selectedType: string | null = null,
): Highlights {
  const selected = selectedId ? graph.resources.find((r) => r.id === selectedId) : undefined;
  if (!selected) {
    if (selectedType) {
      const states = new Map<string, HighlightState>();
      for (const r of graph.resources) states.set(r.id, r.type === selectedType ? 'type' : 'dim');
      if (hoveredId && states.get(hoveredId) === 'dim') states.set(hoveredId, 'hover');
      return { states, links: [] };
    }
    return hoveredId ? { states: new Map([[hoveredId, 'hover']]), links: [] } : NO_HIGHLIGHTS;
  }
  const rel = relationshipsOf(graph, selected.id);
  const states = new Map<string, HighlightState>();
  for (const r of graph.resources) states.set(r.id, 'dim');
  const links: HighlightLink[] = [];

  for (const peer of rel.peers.flatMap((p) => p.others)) states.set(peer.id, 'peer');
  for (const relation of [...rel.dependsOn, ...rel.usedBy]) {
    states.set(relation.resource.id, 'dependency');
    links.push({ from: selected.id, to: relation.resource.id, kind: 'dependency' });
  }
  states.set(selected.id, 'primary');
  if (hoveredId && hoveredId !== selected.id && states.has(hoveredId)) {
    if (states.get(hoveredId) === 'dim') states.set(hoveredId, 'hover');
  }
  const seen = new Set<string>();
  return {
    states,
    links: links.filter((l) => {
      const key = `${l.from}>${l.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  };
}
