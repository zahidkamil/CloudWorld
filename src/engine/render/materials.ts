import { Color, MeshStandardMaterial } from 'three';
import type { HighlightState } from '@/engine/graph/highlight';

/** Materials are shared by everything with the same colour and highlight state (R: reuse geometries and materials). */
const cache = new Map<string, MeshStandardMaterial>();

export const DIM_OPACITY = 0.35;

export interface MaterialLook {
  color: string;
  /** Colour the surface glows with when it is lit (windows, lamps, highlight). */
  emissive?: string;
  /** Base glow even when not highlighted, for windows and lamps. */
  glow?: number;
  roughness?: number;
  metalness?: number;
}

const HIGHLIGHT_GLOW: Record<HighlightState, number> = {
  primary: 0.38,
  type: 0.32,
  dependency: 0.42,
  peer: 0.24,
  hover: 0.22,
  dim: 0,
  none: 0,
};

/** The colour a highlighted surface glows with. */
export const HIGHLIGHT_COLOR: Record<HighlightState, string> = {
  primary: '#ffd479',
  type: '#a78bfa',
  dependency: '#5eead4',
  peer: '#fde68a',
  hover: '#ffffff',
  dim: '#000000',
  none: '#000000',
};

export function materialFor(look: MaterialLook, state: HighlightState): MeshStandardMaterial {
  const key = [
    look.color,
    look.emissive ?? '',
    look.glow ?? 0,
    look.roughness ?? 0.7,
    look.metalness ?? 0.05,
    state,
  ].join('|');
  const hit = cache.get(key);
  if (hit) return hit;

  const dim = state === 'dim';
  const material = new MeshStandardMaterial({
    color: new Color(look.color),
    roughness: look.roughness ?? 0.7,
    metalness: look.metalness ?? 0.05,
    transparent: dim,
    opacity: dim ? DIM_OPACITY : 1,
    depthWrite: !dim,
  });

  const baseGlow = look.emissive ? (look.glow ?? 1) : 0;
  if (look.emissive) {
    material.emissive = new Color(look.emissive);
    material.emissiveIntensity = dim ? baseGlow * 0.35 : baseGlow;
  }
  const highlight = HIGHLIGHT_GLOW[state];
  if (highlight > 0 && !look.emissive) {
    material.emissive = new Color(HIGHLIGHT_COLOR[state]);
    material.emissiveIntensity = highlight;
  } else if (highlight > 0 && look.emissive) {
    material.emissiveIntensity = baseGlow + highlight;
  }
  cache.set(key, material);
  return material;
}
