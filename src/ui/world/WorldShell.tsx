import { lazy, Suspense, useEffect, useMemo, type CSSProperties } from 'react';
import { useSelection } from '@/app/selection';
import { useSession } from '@/app/store';
import { importPlan } from '@/engine/graph/importPlan';
import { detectWebGL } from '@/engine/render/webgl';
import { BUNDLED_SAMPLES } from '@/samples';
import { BUILT_IN_WORLDS } from '@/themes/worlds';
import { DefenderPanel } from '@/apps/defender/DefenderPanel';
import { GraphInspector } from './GraphInspector';
import { usePanelLayout } from './panelLayout';
import './world-shell.css';

const WorldStage = lazy(() => import('./WorldStage'));

/**
 * In-world HUD frame. The 3D renderer, legend, and inspector are mounted here in later tasks.
 */
export function WorldShell() {
  const { mode, themeId, graph, setGraph, setMode, setTheme, returnToMenu } = useSession();
  const fit = useSelection((s) => s.fit);
  const inspectorWidth = usePanelLayout((s) => s.inspectorWidth);
  const setMissionPanelOpen = usePanelLayout((s) => s.setMissionPanelOpen);
  useEffect(() => {
    setMissionPanelOpen(mode === 'defender');
  }, [mode, setMissionPanelOpen]);
  const world = BUILT_IN_WORLDS.find((w) => w.id === themeId);
  const webgl = useMemo(() => detectWebGL(), []);

  // The game is playable straight away: with no plan loaded, the bundled sample opens.
  const hasGraph = graph !== null;
  useEffect(() => {
    if (hasGraph) return;
    const sample = BUNDLED_SAMPLES[0];
    if (!sample) return;
    let cancelled = false;
    void sample.load().then((text) => {
      const result = importPlan(text);
      if (!cancelled && result.ok && useSession.getState().graph === null) setGraph(result.graph);
    });
    return () => {
      cancelled = true;
    };
  }, [hasGraph, setGraph]);

  return (
    <div
      className={`world-shell${mode === 'defender' ? ' has-mission-panel' : ''}`}
      data-theme={themeId}
      style={{ '--inspector-width': `${inspectorWidth}px` } as CSSProperties}
    >
      <header className="hud-bar">
        <button type="button" className="hud-button" onClick={returnToMenu}>
          ← Menu
        </button>
        <div className="hud-title">
          <span className="hud-title__brand">CloudWorld</span>
          <span className="hud-title__world">{world?.name ?? 'Custom world'}</span>
        </div>
        <div className="hud-group" role="group" aria-label="Mission">
          {(['explorer', 'defender'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`hud-button${mode === m ? ' is-active' : ''}`}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === 'explorer' ? 'Showcase' : 'Attack Path'}
            </button>
          ))}
        </div>
        <button type="button" className="hud-button" onClick={fit} title="Frame the whole world">
          Fit view
        </button>
        <label className="hud-select">
          <span className="visually-hidden">Theme</span>
          <select value={themeId} onChange={(e) => setTheme(e.target.value)} aria-label="Theme">
            {BUILT_IN_WORLDS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main className="world-stage" aria-label="World view">
        {webgl.supported ? (
          <Suspense fallback={<p className="world-stage__message">Building your world…</p>}>
            <WorldStage themeId={themeId} />
          </Suspense>
        ) : (
          <div className="world-stage__message" role="alert">
            <strong>3D graphics are not available.</strong>
            <span>{webgl.reason} Try a current version of Chrome, Edge, Firefox, or Safari.</span>
          </div>
        )}
      </main>
      <p className="world-hint" aria-hidden="true">
        Drag to orbit · Right-drag to pan · Scroll to zoom · Click a building to inspect it
      </p>
      {mode === 'defender' && <DefenderPanel />}
      <GraphInspector />
    </div>
  );
}
