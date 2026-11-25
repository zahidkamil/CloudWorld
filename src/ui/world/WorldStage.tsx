import { useEffect, useMemo, useState } from 'react';
import { useSelection } from '@/app/selection';
import { useSession } from '@/app/store';
import { computeHighlights, NO_HIGHLIGHTS } from '@/engine/graph/highlight';
import { layoutGraph } from '@/engine/layout/layout';
import type { ScenePalette } from '@/engine/render/palette';
import { WorldCanvas } from '@/engine/render/WorldCanvas';
import { WorldScene } from '@/engine/render/WorldScene';
import { fitDistance } from '@/engine/render/cameraView';
import { insetsFor, usePanelLayout } from './panelLayout';

/** Interim palettes that echo each reference image until the Blender libraries replace them (Tasks 5 and 6). */
const PALETTES: Record<string, ScenePalette> = {
  'modern-city': {
    background: '#bfe6fb',
    ground: '#7bc043',
    earth: '#c8794a',
    base: '#d8c3a5',
    roof: '#cfd3dc',
    accent: '#f3a6c8',
    glow: '#ffd479',
    skyLight: '#d9f1ff',
    groundLight: '#8a7a5a',
    keyLight: '#fff1d6',
    keyIntensity: 2.4,
    fillIntensity: 0.85,
    decor: 'blossom',
  },
  'haunted-world': {
    background: '#1b2347',
    ground: '#675f7e',
    earth: '#3a3550',
    base: '#6b7090',
    roof: '#3c4f9c',
    accent: '#ff9a3c',
    glow: '#ffb454',
    skyLight: '#8896e0',
    groundLight: '#3a3366',
    keyLight: '#b4c3ff',
    keyIntensity: 2.1,
    fillIntensity: 1.1,
    decor: 'pine',
  },
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

/** Lazily loaded so three.js stays out of the menu bundle. Connects the stores to the shared scene. */
export default function WorldStage({ themeId }: { themeId: string }) {
  const graph = useSession((s) => s.graph);
  const selectedId = useSelection((s) => s.selectedId);
  const hoveredId = useSelection((s) => s.hoveredId);
  const focus = useSelection((s) => s.focus);
  const fitNonce = useSelection((s) => s.fitNonce);
  const select = useSelection((s) => s.select);
  const hover = useSelection((s) => s.hover);
  const [reducedMotion] = useState(prefersReducedMotion);
  const inspectorWidth = usePanelLayout((s) => s.inspectorWidth);
  const missionPanelOpen = usePanelLayout((s) => s.missionPanelOpen);
  const insets = insetsFor({ inspectorWidth, missionPanelOpen }, window.innerWidth);
  const palette = PALETTES[themeId] ?? PALETTES['modern-city']!;

  // The layout depends on the graph only, never on the theme (themes must not change the infrastructure).
  const layout = useMemo(() => layoutGraph(graph ?? { resources: [], regions: [] }), [graph]);
  const highlights = useMemo(
    () => (graph ? computeHighlights(graph, selectedId, hoveredId) : NO_HIGHLIGHTS),
    [graph, selectedId, hoveredId],
  );
  const selectedKnown = graph?.resources.some((r) => r.id === selectedId) ?? false;
  const highlightCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const state of highlights.states.values()) counts[state] = (counts[state] ?? 0) + 1;
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
  }, [highlights]);

  useEffect(() => () => void (document.body.style.cursor = ''), []);

  return (
    <WorldCanvas
      themeId={themeId}
      background={palette.background}
      maxDistance={fitDistance(layout.bounds.radius) * 1.8}
      onMissed={() => select(null)}
      dataAttrs={{
        'data-selected': selectedKnown ? (selectedId ?? '') : '',
        'data-hovered': hoveredId ?? '',
        'data-highlights': highlightCounts,
        'data-landmarks': String(layout.lots.length),
        'data-islands': String(layout.islands.length),
      }}
    >
      <WorldScene
        graph={graph}
        layout={layout}
        palette={palette}
        highlights={highlights}
        selectedId={selectedKnown ? selectedId : null}
        focusId={focus?.id ?? null}
        focusNonce={focus?.nonce ?? 0}
        fitNonce={fitNonce}
        reducedMotion={reducedMotion}
        insets={insets}
        onSelect={select}
        onHover={hover}
      />
    </WorldCanvas>
  );
}
