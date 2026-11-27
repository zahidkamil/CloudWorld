import { useGLTF } from '@react-three/drei';
import { Suspense, useLayoutEffect, useMemo, useRef, type ReactElement } from 'react';
import { Matrix4, Object3D, type BufferGeometry, type InstancedMesh, type Material, type Mesh } from 'three';
import { DRACO_PATH } from '@/engine/render/GltfLandmark';
import type { LayoutDistrict, LayoutLot } from '@/engine/layout/types';
import { libraryAssetUrl, type LibraryProp, type WorldLibrary } from '@/themes/library';
import { placeProps, type PropPlacement, type Spot } from './streetPlan';
import { ROAD_TOP, SIDEWALK_TOP, STREET_BASE } from './StreetField';

const GROUND: Record<PropPlacement, number> = { road: ROAD_TOP, sidewalk: SIDEWALK_TOP, lot: STREET_BASE };

interface Part {
  geometry: BufferGeometry;
  material: Material | Material[];
  matrix: Matrix4;
}

function InstancedPart({ part, matrices }: { part: Part; matrices: Matrix4[] }): ReactElement {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new Matrix4();
    matrices.forEach((spot, i) => mesh.setMatrixAt(i, m.multiplyMatrices(spot, part.matrix)));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [part, matrices]);
  return (
    <instancedMesh
      ref={ref}
      args={[part.geometry, part.material, matrices.length]}
      castShadow
      receiveShadow
    />
  );
}

/** Every placement of one prop model, one instanced draw call per mesh of the model (three at most). */
function PropInstances({
  url,
  spots,
  ground,
  scale,
}: {
  url: string;
  spots: Spot[];
  ground: number;
  scale: number;
}) {
  const { scene } = useGLTF(url, DRACO_PATH);
  const parts = useMemo(() => {
    scene.updateMatrixWorld(true);
    const out: Part[] = [];
    scene.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh)
        out.push({ geometry: mesh.geometry, material: mesh.material, matrix: mesh.matrixWorld.clone() });
    });
    return out;
  }, [scene]);
  const matrices = useMemo(() => {
    const dummy = new Object3D();
    return spots.map((s) => {
      dummy.position.set(s.x, ground, s.z);
      dummy.rotation.set(0, s.rot, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });
  }, [spots, ground, scale]);
  return (
    <>
      {parts.map((part, i) => (
        <InstancedPart key={i} part={part} matrices={matrices} />
      ))}
    </>
  );
}

interface PropFieldProps {
  library: WorldLibrary;
  props: LibraryProp[];
  districts: LayoutDistrict[];
  lots: LayoutLot[];
}

/**
 * Decorative street life from the world library (cabs, food carts, cafés, lanterns...). Props are placed
 * deterministically from the layout, never represent resources, and have no pointer handlers.
 */
export function PropField({ library, props, districts, lots }: PropFieldProps): ReactElement {
  const spots = useMemo(() => placeProps(districts, lots, props), [districts, lots, props]);
  return (
    <>
      {props.map((prop, i) =>
        spots[i]!.length > 0 ? (
          <Suspense key={prop.file} fallback={null}>
            <PropInstances
              url={libraryAssetUrl(library, prop.file)}
              spots={spots[i]!}
              ground={GROUND[prop.placement]}
              scale={prop.scale}
            />
          </Suspense>
        ) : null,
      )}
    </>
  );
}
