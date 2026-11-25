import { useLayoutEffect, useMemo, useRef, type ReactElement } from 'react';
import { Color, Object3D, type InstancedMesh } from 'three';
import type { LayoutIsland } from '@/engine/layout/types';
import { hashString } from '@/themes/variation';
import type { ScenePalette } from './palette';

interface Prop {
  x: number;
  z: number;
  scale: number;
  colorIndex: number;
}

/** Deterministic props around the island rim, so edges are never bare. Seeded by the island id. */
function rimProps(island: LayoutIsland): Prop[] {
  const out: Prop[] = [];
  const spacing = 4.2;
  const inset = 0.9;
  const hw = island.width / 2 - inset;
  const hd = island.depth / 2 - inset;
  let n = 0;
  const push = (x: number, z: number) => {
    const h = hashString(`${island.id}:${n}`);
    n += 1;
    if (h % 5 === 0) return; // leave gaps
    out.push({ x, z, scale: 0.75 + ((h >>> 8) % 40) / 100, colorIndex: (h >>> 4) % 3 });
  };
  for (let x = -hw; x <= hw; x += spacing) {
    push(x, -hd);
    push(x, hd);
  }
  for (let z = -hd + spacing; z < hd; z += spacing) {
    push(-hw, z);
    push(hw, z);
  }
  return out;
}

export function Decor({
  island,
  palette,
}: {
  island: LayoutIsland;
  palette: ScenePalette;
}): ReactElement | null {
  const props = useMemo(() => rimProps(island), [island]);
  const crowns = useRef<InstancedMesh>(null);
  const trunks = useRef<InstancedMesh>(null);
  const colors = useMemo(
    () =>
      palette.decor === 'blossom'
        ? ['#7bc043', '#8ccf52', palette.accent]
        : ['#2f5a52', '#3b6a5c', '#5a4a86'],
    [palette],
  );

  useLayoutEffect(() => {
    const crown = crowns.current;
    const trunk = trunks.current;
    if (!crown || !trunk) return;
    const dummy = new Object3D();
    const color = new Color();
    props.forEach((p, i) => {
      dummy.position.set(p.x, 0.75 * p.scale + 0.2, p.z);
      dummy.scale.set(p.scale, palette.decor === 'pine' ? p.scale * 1.5 : p.scale, p.scale);
      dummy.updateMatrix();
      crown.setMatrixAt(i, dummy.matrix);
      crown.setColorAt(i, color.set(colors[p.colorIndex]!));
      dummy.position.set(p.x, 0.3 * p.scale + 0.15, p.z);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      trunk.setMatrixAt(i, dummy.matrix);
    });
    crown.instanceMatrix.needsUpdate = true;
    if (crown.instanceColor) crown.instanceColor.needsUpdate = true;
    trunk.instanceMatrix.needsUpdate = true;
  }, [props, colors, palette.decor]);

  if (props.length === 0) return null;
  return (
    <group position={[island.x, 0, island.z]}>
      <instancedMesh ref={trunks} args={[undefined, undefined, props.length]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.6, 6]} />
        <meshStandardMaterial color={palette.decor === 'blossom' ? '#7a4b2a' : '#3b2a2a'} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, props.length]} castShadow>
        {palette.decor === 'blossom' ? (
          <icosahedronGeometry args={[0.46, 1]} />
        ) : (
          <coneGeometry args={[0.42, 1, 7]} />
        )}
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
    </group>
  );
}
