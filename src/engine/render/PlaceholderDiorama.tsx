/**
 * Temporary scene used until the graph-driven world arrives in Task 3.
 * It exercises lights, shadows, and materials so cross-browser tests verify real rendering.
 */
interface PlaceholderDioramaProps {
  ground: string;
  building: string;
  glow: string;
}

const LOTS: [number, number, number][] = [
  [-4, -4, 5],
  [0, -4, 3],
  [4, -4, 7],
  [-4, 0, 2.5],
  [0, 0, 9],
  [4, 0, 4],
  [-4, 4, 6],
  [0, 4, 3.5],
  [4, 4, 5],
];

export function PlaceholderDiorama({ ground, building, glow }: PlaceholderDioramaProps) {
  return (
    <group>
      <hemisphereLight args={['#c7d2fe', '#1f2937', 0.6]} />
      <directionalLight position={[12, 20, 8]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <boxGeometry args={[14, 14, 0.4]} />
        <meshStandardMaterial color={ground} />
      </mesh>
      {LOTS.map(([x, z, h]) => (
        <group key={`${x}:${z}`} position={[x, 0, z]}>
          <mesh position-y={h / 2 + 0.2} castShadow receiveShadow>
            <boxGeometry args={[2.2, h, 2.2]} />
            <meshStandardMaterial color={building} roughness={0.7} />
          </mesh>
          <mesh position-y={h + 0.3}>
            <boxGeometry args={[1.4, 0.2, 1.4]} />
            <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
