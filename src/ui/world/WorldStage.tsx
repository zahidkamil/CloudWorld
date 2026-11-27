import { useEffect, useMemo, useState } from 'react';
import { loadWorldLibrary, type WorldLibrary } from '@/themes/library';
import { useSelection } from '@/app/selection';
import { useSession } from '@/app/store';
import { computeHighlights, NO_HIGHLIGHTS } from '@/engine/graph/highlight';
import { layoutGraph } from '@/engine/layout/layout';
import type { ScenePalette } from '@/engine/render/palette';
import { WorldCanvas } from '@/engine/render/WorldCanvas';
import { WorldScene } from '@/engine/render/WorldScene';
import { fitDistance } from '@/engine/render/cameraView';
import { insetsFor, usePanelLayout } from './panelLayout';

/** Loading fallbacks. The real palettes live in public/worlds/<id>/library.json (`scene`, `nightScene`). */
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
    background: '#141a3a',
    ground: '#4f4a68',
    earth: '#2c2640',
    base: '#5b5f78',
    roof: '#2f3d7d',
    accent: '#ff8a2b',
    glow: '#ffb454',
    skyLight: '#7686e0',
    groundLight: '#241d40',
    keyLight: '#a9b9ff',
    keyIntensity: 2.3,
    fillIntensity: 1.05,
    decor: 'pine',
    fog: 0.9,
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
  const lightingPreset = useSession((s) => s.lightingPreset);
  const selectedId = useSelection((s) => s.selectedId);
  const hoveredId = useSelection((s) => s.hoveredId);
  const selectedType = useSelection((s) => s.selectedType);
  const showLabels = useSelection((s) => s.showLabels);
  const focus = useSelection((s) => s.focus);
  const fitNonce = useSelection((s) => s.fitNonce);
  const select = useSelection((s) => s.select);
  const hover = useSelection((s) => s.hover);
  const [reducedMotion] = useState(prefersReducedMotion);
  const [library, setLibrary] = useState<WorldLibrary | null>(null);
  const inspectorWidth = usePanelLayout((s) => s.inspectorWidth);
  const missionPanelOpen = usePanelLayout((s) => s.missionPanelOpen);
  const insets = insetsFor({ inspectorWidth, missionPanelOpen }, window.innerWidth);

  useEffect(() => {
    let cancelled = false;
    void loadWorldLibrary(themeId).then((next) => {
      if (!cancelled) setLibrary(next);
    });
    return () => {
      cancelled = true;
    };
  }, [themeId]);

  const activeLibrary = library?.id === themeId ? library : null;
  const libraryStatus = activeLibrary ? 'loaded' : 'loading';
  // Each world library owns its palettes. The fallbacks only show while library.json loads.
  const palette: ScenePalette =
    (lightingPreset === 'night' ? activeLibrary?.nightScene : undefined) ??
    activeLibrary?.scene ??
    PALETTES[themeId] ??
    PALETTES['modern-city']!;

  // The layout depends on the graph only, never on the theme (themes must not change the infrastructure).
  const layout = useMemo(() => layoutGraph(graph ?? { resources: [], regions: [] }), [graph]);
  const highlights = useMemo(
    () => (graph ? computeHighlights(graph, selectedId, hoveredId, selectedType) : NO_HIGHLIGHTS),
    [graph, selectedId, hoveredId, selectedType],
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
        'data-library': libraryStatus,
        'data-selected': selectedKnown ? (selectedId ?? '') : '',
        'data-hovered': hoveredId ?? '',
        'data-highlights': highlightCounts,
        'data-landmarks': String(layout.lots.length),
        'data-islands': String(layout.islands.length),
      }}
    >
      <WorldScene
        graph={graph}
        library={activeLibrary}
        layout={layout}
        palette={palette}
        highlights={highlights}
        selectedId={selectedKnown ? selectedId : null}
        hoveredId={hoveredId}
        showLabels={showLabels}
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
