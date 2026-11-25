import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

/** Marks the selected landmark: a bobbing arrow above it and a ring on the ground. Static when motion is reduced. */
export function Beacon({
  x,
  z,
  top,
  reducedMotion,
}: {
  x: number;
  z: number;
  top: number;
  reducedMotion: boolean;
}) {
  const arrow = useRef<Group>(null);
  const ring = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    if (arrow.current) arrow.current.position.y = top + 0.9 + Math.sin(t * 2.4) * 0.18;
    if (ring.current) ring.current.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
  });
  return (
    <group position={[x, 0, z]}>
      <group ref={arrow} position={[0, top + 0.9, 0]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.38, 0.8, 4]} />
          <meshStandardMaterial color="#ffffff" emissive="#fff3b0" emissiveIntensity={1.4} />
        </mesh>
      </group>
      <group ref={ring} position={[0, 0.22, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.75, 2.0, 40]} />
          <meshBasicMaterial color="#fff3b0" transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
}
