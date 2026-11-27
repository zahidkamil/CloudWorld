import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, type ReactElement } from 'react';
import type { Color, Material, Mesh, Object3D } from 'three';
import type { HighlightState } from '@/engine/graph/highlight';
import { DIM_OPACITY, HIGHLIGHT_COLOR } from './materials';

const MAX_CLICK_DRAG = 4;

/** Self-hosted Draco decoder (public/draco/), so GLBs load without a third-party CDN. */
export const DRACO_PATH = `${import.meta.env.BASE_URL}draco/`;

interface GltfLandmarkProps {
  id: string;
  url: string;
  scale: number;
  yOffset: number;
  x: number;
  y: number;
  z: number;
  state: HighlightState;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

type MaterialSnapshot = {
  material: Material & {
    opacity: number;
    transparent: boolean;
    emissive?: Color;
    emissiveIntensity?: number;
  };
  opacity: number;
  transparent: boolean;
  emissive?: Color;
  emissiveIntensity?: number;
};

function cloneWithMaterials(source: Object3D): { scene: Object3D; materials: MaterialSnapshot[] } {
  const scene = source.clone(true);
  const materials: MaterialSnapshot[] = [];
  scene.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const originals = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const cloned = originals.map((m) => m.clone());
    mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0]!;
    for (const material of cloned) {
      const m = material as MaterialSnapshot['material'];
      materials.push({
        material: m,
        opacity: m.opacity,
        transparent: m.transparent,
        ...(m.emissive ? { emissive: m.emissive.clone(), emissiveIntensity: m.emissiveIntensity } : {}),
      });
    }
  });
  return { scene, materials };
}

function applyState(materials: MaterialSnapshot[], state: HighlightState) {
  const dim = state === 'dim';
  const bright =
    state === 'primary' ||
    state === 'type' ||
    state === 'dependency' ||
    state === 'peer' ||
    state === 'hover';
  for (const item of materials) {
    const material = item.material;
    material.transparent = dim || item.transparent;
    material.opacity = dim ? item.opacity * DIM_OPACITY : item.opacity;
    if (item.emissive) {
      material.emissive?.copy(item.emissive);
      material.emissiveIntensity = (item.emissiveIntensity ?? 0) + (bright ? 0.2 : 0);
    } else if (bright && material.emissive) {
      material.emissive.set(HIGHLIGHT_COLOR[state]);
      material.emissiveIntensity = state === 'primary' ? 0.32 : 0.16;
    }
    material.needsUpdate = true;
  }
}

/** A lazily loaded, cached GLB landmark from a world's library. It falls back to procedural geometry while loading. */
export function GltfLandmark({
  id,
  url,
  scale,
  yOffset,
  x,
  y,
  z,
  state,
  onSelect,
  onHover,
}: GltfLandmarkProps): ReactElement {
  const { scene: source } = useGLTF(url, DRACO_PATH);
  const asset = useMemo(() => cloneWithMaterials(source), [source]);

  useEffect(() => {
    applyState(asset.materials, state);
  }, [asset, state]);

  useEffect(
    () => () => {
      for (const item of asset.materials) item.material.dispose();
    },
    [asset],
  );

  return (
    <group
      position={[x, y + yOffset, z]}
      scale={scale}
      userData={{ resourceId: id }}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        onHover(id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = '';
      }}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        if (event.delta > MAX_CLICK_DRAG) return;
        event.stopPropagation();
        onSelect(id);
      }}
    >
      <primitive object={asset.scene} />
    </group>
  );
}
