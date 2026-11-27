import type { HighlightState } from '@/engine/graph/highlight';

/** Selected and hovered resources are named even when the all-label layer is off. */
export function shouldShowResourceLabel(
  state: HighlightState,
  resourceId: string,
  hoveredId: string | null,
  showLabels: boolean,
): boolean {
  return showLabels || resourceId === hoveredId || state === 'primary' || state === 'type';
}
