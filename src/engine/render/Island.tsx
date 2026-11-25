import { Html } from '@react-three/drei';
import { useMemo, type ReactElement } from 'react';
import type { LayoutDistrict, LayoutIsland } from '@/engine/layout/types';
import { azTint, mixHex } from '@/themes/variation';
import { materialFor } from './materials';
import type { ScenePalette } from './palette';

interface IslandProps {
  island: LayoutIsland;
  districts: LayoutDistrict[];
  palette: ScenePalette;
  /** Accent for this island (region colour). */
  accent: string;
}

const SLAB_TOP = 0.3;
const SLAB_DEPTH = 1.5;
const PAD_HEIGHT = 0.1;

/** A floating slab for a region (or the global hub), with a coloured rim and one pad per district. */
export function Island({ island, districts, palette, accent }: IslandProps): ReactElement {
  const topColor = useMemo(() => mixHex(palette.ground, accent, 0.08), [palette.ground, accent]);
  const mats = useMemo(
    () => ({
      top: materialFor({ color: topColor, roughness: 0.95 }, 'none'),
      earth: materialFor({ color: palette.earth, roughness: 0.95 }, 'none'),
      rim: materialFor({ color: accent, emissive: accent, glow: 0.35, roughness: 0.5 }, 'none'),
    }),
    [topColor, palette.earth, accent],
  );

  return (
    <group position={[island.x, 0, island.z]}>
      <mesh position={[0, -SLAB_TOP / 2, 0]} material={mats.top} receiveShadow castShadow>
        <boxGeometry args={[island.width, SLAB_TOP, island.depth]} />
      </mesh>
      <mesh position={[0, -SLAB_TOP - SLAB_DEPTH / 2, 0]} material={mats.earth} castShadow>
        <boxGeometry args={[island.width - 0.6, SLAB_DEPTH, island.depth - 0.6]} />
      </mesh>
      <mesh position={[0, -SLAB_TOP - 0.05, 0]} material={mats.rim}>
        <boxGeometry args={[island.width + 0.3, 0.16, island.depth + 0.3]} />
      </mesh>

      {districts.map((d) => {
        const tint = d.az ? azTint(accent, d.az) : accent;
        const padColor = mixHex(palette.ground, tint, d.kind === 'az' ? 0.3 : 0.18);
        return (
          <mesh
            key={d.id}
            position={[d.x - island.x, PAD_HEIGHT / 2, d.z - island.z]}
            material={materialFor({ color: padColor, roughness: 0.9 }, 'none')}
            receiveShadow
          >
            <boxGeometry args={[d.width - 0.3, PAD_HEIGHT, d.depth - 0.3]} />
          </mesh>
        );
      })}

      {/* DOM labels keep the 3D scene free of text meshes. */}
      <Html
        position={[-island.width / 2 + 3.2, 1.4, -island.depth / 2 + 0.4]}
        center
        zIndexRange={[5, 0]}
        className="scene-label scene-label--island"
      >
        {island.name}
      </Html>
      {districts
        .filter((d) => d.kind === 'az' || d.kind === 'regional')
        .map((d) => (
          <Html
            key={d.id}
            position={[d.x - island.x, 0.35, d.z - island.z + d.depth / 2 - 0.35]}
            center
            zIndexRange={[4, 0]}
            className="scene-label scene-label--district"
          >
            {d.name}
          </Html>
        ))}
    </group>
  );
}
