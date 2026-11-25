import { useMemo, type ReactElement } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { HighlightState } from '@/engine/graph/highlight';
import { landmarkGeometry } from './landmarkGeometry';
import type { LandmarkKind } from './landmarkKind';
import { materialFor } from './materials';

export interface LandmarkLook {
  body: string;
  trim: string;
  glow: string;
}

interface LandmarkProps {
  id: string;
  kind: LandmarkKind;
  x: number;
  y: number;
  z: number;
  look: LandmarkLook;
  state: HighlightState;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

/** Ignore a click that was really the end of a camera drag. */
const MAX_CLICK_DRAG = 4;

export function Landmark({ id, kind, x, y, z, look, state, onSelect, onHover }: LandmarkProps): ReactElement {
  const geometry = landmarkGeometry(kind);
  const materials = useMemo(
    () => ({
      body: materialFor({ color: look.body, roughness: 0.78 }, state),
      trim: materialFor({ color: look.trim, roughness: 0.6 }, state),
      glow: materialFor({ color: look.glow, emissive: look.glow, glow: 1.1, roughness: 0.4 }, state),
    }),
    [look.body, look.trim, look.glow, state],
  );
  const dim = state === 'dim';

  return (
    <group
      position={[x, y, z]}
      userData={{ resourceId: id }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onHover(id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = '';
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (e.delta > MAX_CLICK_DRAG) return;
        e.stopPropagation();
        onSelect(id);
      }}
    >
      <mesh geometry={geometry.body} material={materials.body} castShadow={!dim} receiveShadow />
      <mesh geometry={geometry.trim} material={materials.trim} castShadow={!dim} receiveShadow />
      <mesh geometry={geometry.glow} material={materials.glow} />
    </group>
  );
}
