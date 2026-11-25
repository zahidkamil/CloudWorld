import { QuadraticBezierLine } from '@react-three/drei';
import { useMemo, type ReactElement } from 'react';
import type { Highlights } from '@/engine/graph/highlight';
import type { InfrastructureGraph } from '@/engine/graph/types';
import type { WorldLayout } from '@/engine/layout/types';
import { azTint, mixHex, regionAccents } from '@/themes/variation';
import { Beacon } from './Beacon';
import { CameraRig, type FocusTarget } from './CameraRig';
import { Decor } from './Decor';
import { Island } from './Island';
import { Landmark, type LandmarkLook } from './Landmark';
import { landmarkKindOf, LANDMARK_HEIGHT, type LandmarkKind } from './landmarkKind';
import type { ScenePalette } from './palette';

const PAD_TOP = 0.1;
const LINK_COLOR = '#5eead4';

interface WorldSceneProps {
  graph: InfrastructureGraph | null;
  layout: WorldLayout;
  palette: ScenePalette;
  highlights: Highlights;
  selectedId: string | null;
  focusId: string | null;
  focusNonce: number;
  fitNonce: number;
  reducedMotion: boolean;
  /** Pixels covered by side panels. The scene is framed in the free area between them. */
  insets: { left: number; right: number };
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

interface Placed {
  id: string;
  kind: LandmarkKind;
  x: number;
  z: number;
  look: LandmarkLook;
}

/** Draws the layout of a graph: islands, districts, landmarks, highlights, and the camera rig. */
export function WorldScene({
  graph,
  layout,
  palette,
  highlights,
  selectedId,
  focusId,
  focusNonce,
  fitNonce,
  reducedMotion,
  insets,
  onSelect,
  onHover,
}: WorldSceneProps): ReactElement {
  const accents = useMemo(
    () =>
      regionAccents(
        palette.accent,
        layout.islands.filter((i) => i.kind === 'region').map((i) => i.name),
      ),
    [layout.islands, palette.accent],
  );
  const islandAccent = (kind: string, name: string) =>
    kind === 'region' ? (accents.get(name) ?? palette.accent) : kind === 'global' ? palette.glow : '#94a3b8';

  const placed = useMemo(() => {
    if (!graph) return [] as Placed[];
    const byId = new Map(graph.resources.map((r) => [r.id, r]));
    const districtById = new Map(layout.districts.map((d) => [d.id, d]));
    return layout.lots.flatMap((lot) => {
      const r = byId.get(lot.resourceId);
      const district = districtById.get(lot.districtId);
      if (!r || !district) return [];
      const accent = district.region ? (accents.get(district.region) ?? palette.accent) : palette.accent;
      const tint = district.az ? azTint(accent, district.az) : accent;
      return [
        {
          id: r.id,
          kind: landmarkKindOf(r.type, r.category),
          x: lot.x,
          z: lot.z,
          look: {
            body: mixHex(palette.base, accent, 0.07),
            trim: mixHex(palette.roof, tint, 0.45),
            glow: palette.glow,
          },
        },
      ];
    });
  }, [graph, layout, accents, palette]);

  const positionOf = useMemo(() => new Map(placed.map((p) => [p.id, p])), [placed]);
  const topOf = (id: string) => PAD_TOP + (LANDMARK_HEIGHT[positionOf.get(id)?.kind ?? 'block'] ?? 2);
  const selected = selectedId ? positionOf.get(selectedId) : undefined;
  const focusPlaced = focusId ? positionOf.get(focusId) : undefined;
  const focus: FocusTarget | null = focusPlaced
    ? { nonce: focusNonce, x: focusPlaced.x, y: PAD_TOP + 1.2, z: focusPlaced.z }
    : null;
  const radius = layout.bounds.radius;
  const layoutKey = `${layout.lots.length}:${layout.islands.map((i) => i.id).join(',')}`;

  return (
    <>
      <fog attach="fog" args={[palette.background, radius * 2.6, radius * 8]} />
      <hemisphereLight args={[palette.skyLight, palette.groundLight, palette.fillIntensity]} />
      <directionalLight
        color={palette.keyLight}
        intensity={palette.keyIntensity}
        position={[radius * 0.9, radius * 1.3, radius * 0.7]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-radius * 1.05}
        shadow-camera-right={radius * 1.05}
        shadow-camera-top={radius * 1.05}
        shadow-camera-bottom={-radius * 1.05}
        shadow-camera-near={1}
        shadow-camera-far={radius * 5}
        shadow-bias={-0.0006}
      />

      {layout.islands.map((island) => (
        <group key={island.id}>
          <Island
            island={island}
            districts={layout.districts.filter((d) => d.islandId === island.id)}
            palette={palette}
            accent={islandAccent(island.kind, island.name)}
          />
          <Decor island={island} palette={palette} />
        </group>
      ))}

      {placed.map((p) => (
        <Landmark
          key={p.id}
          id={p.id}
          kind={p.kind}
          x={p.x}
          y={PAD_TOP}
          z={p.z}
          look={p.look}
          state={highlights.states.get(p.id) ?? 'none'}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}

      {selected && (
        <Beacon x={selected.x} z={selected.z} top={topOf(selected.id)} reducedMotion={reducedMotion} />
      )}
      {highlights.links.map((link) => {
        const a = positionOf.get(link.from);
        const b = positionOf.get(link.to);
        if (!a || !b) return null;
        const start: [number, number, number] = [a.x, topOf(a.id) * 0.6, a.z];
        const end: [number, number, number] = [b.x, topOf(b.id) * 0.6, b.z];
        const span = Math.hypot(a.x - b.x, a.z - b.z);
        const mid: [number, number, number] = [
          (a.x + b.x) / 2,
          Math.max(start[1], end[1]) + 1.5 + span * 0.18,
          (a.z + b.z) / 2,
        ];
        return (
          <QuadraticBezierLine
            key={`${link.from}>${link.to}`}
            start={start}
            end={end}
            mid={mid}
            color={LINK_COLOR}
            lineWidth={2.4}
            transparent
            opacity={0.9}
          />
        );
      })}

      <CameraRig
        layoutKey={layoutKey}
        radius={radius}
        focus={focus}
        fitNonce={fitNonce}
        reducedMotion={reducedMotion}
        insets={insets}
      />
    </>
  );
}
