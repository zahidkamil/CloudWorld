import { Html } from '@react-three/drei';
import type { HighlightState } from '@/engine/graph/highlight';

interface ResourceLabelProps {
  x: number;
  y: number;
  z: number;
  type: string;
  name: string;
  state: HighlightState;
  visible: boolean;
}

/** DOM nameplate: readable at every browser zoom, no costly 3D text geometry. */
export function ResourceLabel({ x, y, z, type, name, state, visible }: ResourceLabelProps) {
  if (!visible) return null;
  return (
    <Html
      position={[x, y, z]}
      center
      zIndexRange={[8, 0]}
      className={`resource-label resource-label--${state}`}
      pointerEvents="none"
      distanceFactor={12}
    >
      <span className="resource-label__type">{type}</span>
      <span className="resource-label__name">({name})</span>
    </Html>
  );
}
