import { useLayoutEffect, useMemo, useRef, type ReactElement } from 'react';
import { AdditiveBlending, CircleGeometry, Object3D, type InstancedMesh } from 'three';
import type { LayoutDistrict } from '@/engine/layout/types';
import type { LibraryStreets } from '@/themes/library';
import { planStreets, type Spot, type Strip } from './streetPlan';

/** District pads are 0.1 tall (Island.tsx). Streets sit on top of them. */
export const STREET_BASE = 0.1;
export const SIDEWALK_TOP = STREET_BASE + 0.06;
/** Roads sit a hair above the sidewalk band they are drawn over; paint sits on the road. */
export const ROAD_TOP = SIDEWALK_TOP + 0.005;
const PAINT_TOP = ROAD_TOP + 0.007;

interface BoxesProps {
  items: Strip[];
  y: number;
  height: number;
  color: string;
  emissive?: string;
  roughness?: number;
}

/** One draw call for every strip of one kind across the whole world. */
function InstancedBoxes({
  items,
  y,
  height,
  color,
  emissive,
  roughness = 0.9,
}: BoxesProps): ReactElement | null {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    items.forEach((s, i) => {
      dummy.position.set(s.x, y - height / 2, s.z);
      dummy.scale.set(s.w, height, s.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, y, height]);
  if (items.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        {...(emissive ? { emissive, emissiveIntensity: 0.6 } : {})}
      />
    </instancedMesh>
  );
}

interface SpotsProps {
  spots: Spot[];
  /** Ground height of every spot. */
  base: number;
  /** Height of the mesh centre above the ground, multiplied by the instance scale. */
  lift: number;
  children: ReactElement[];
  castShadow?: boolean;
  scale?: (i: number) => number;
}

function InstancedSpots({ spots, base, lift, children, castShadow, scale }: SpotsProps): ReactElement | null {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    spots.forEach((s, i) => {
      const k = scale ? scale(i) : 1;
      dummy.position.set(s.x, base + lift * k, s.z);
      dummy.rotation.set(0, s.rot, 0);
      dummy.scale.setScalar(k);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [spots, base, lift, scale]);
  if (spots.length === 0) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, spots.length]} castShadow={castShadow}>
      {children}
    </instancedMesh>
  );
}

interface StreetFieldProps {
  districts: LayoutDistrict[];
  streets: LibraryStreets;
}

/**
 * Ring roads, sidewalks, lane paint, crosswalks, lamps, light pools and street trees for every district,
 * coloured by the world library. About a dozen draw calls for the whole world.
 */
export function StreetField({ districts, streets }: StreetFieldProps): ReactElement {
  const plan = useMemo(() => planStreets(districts), [districts]);
  const treeScale = useMemo(() => {
    const scales = plan.trees.map(
      (t) => 0.62 + (Math.abs(Math.sin(t.x * 12.9898 + t.z * 78.233)) % 1) * 0.22,
    );
    return (i: number) => scales[i] ?? 0.7;
  }, [plan.trees]);
  const base = SIDEWALK_TOP;
  const poolGeometry = useMemo(() => new CircleGeometry(0.75, 20).rotateX(-Math.PI / 2), []);
  return (
    <group>
      <InstancedBoxes items={plan.sidewalks} y={SIDEWALK_TOP} height={0.06} color={streets.sidewalk} />
      <InstancedBoxes items={plan.roads} y={ROAD_TOP} height={0.04} color={streets.road} />
      {streets.marking && (
        <InstancedBoxes
          items={plan.markings}
          y={PAINT_TOP}
          height={0.01}
          color={streets.marking}
          roughness={0.7}
        />
      )}
      {streets.crosswalk && (
        <InstancedBoxes
          items={plan.crosswalks}
          y={PAINT_TOP}
          height={0.01}
          color={streets.crosswalk}
          roughness={0.7}
        />
      )}
      <InstancedSpots spots={plan.lamps} base={base} lift={0.65} castShadow>
        {[
          <cylinderGeometry key="g" args={[0.035, 0.055, 1.3, 6]} />,
          <meshStandardMaterial key="m" color={streets.lampPost} roughness={0.55} metalness={0.35} />,
        ]}
      </InstancedSpots>
      <InstancedSpots spots={plan.lamps} base={base} lift={1.38}>
        {[
          <sphereGeometry key="g" args={[0.12, 10, 8]} />,
          <meshStandardMaterial
            key="m"
            color={streets.lampGlow}
            emissive={streets.lampGlow}
            emissiveIntensity={1.1}
            toneMapped={false}
          />,
        ]}
      </InstancedSpots>
      {streets.lightPools && (
        <InstancedSpots spots={plan.lamps} base={PAINT_TOP + 0.004} lift={0}>
          {[
            <primitive key="g" object={poolGeometry} attach="geometry" />,
            <meshBasicMaterial
              key="m"
              color={streets.lampGlow}
              transparent
              opacity={0.42}
              blending={AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />,
          ]}
        </InstancedSpots>
      )}
      {streets.tree && (
        <>
          <InstancedSpots spots={plan.trees} base={base} lift={0.4} castShadow scale={treeScale}>
            {[
              <cylinderGeometry key="g" args={[0.06, 0.1, 0.8, 6]} />,
              <meshStandardMaterial key="m" color={streets.trunk ?? '#765038'} roughness={0.92} />,
            ]}
          </InstancedSpots>
          <InstancedSpots spots={plan.trees} base={base} lift={1.05} castShadow scale={treeScale}>
            {[
              <icosahedronGeometry key="g" args={[0.42, 1]} />,
              <meshStandardMaterial key="m" color={streets.tree} roughness={0.85} flatShading />,
            ]}
          </InstancedSpots>
        </>
      )}
    </group>
  );
}
