import { lazy, Suspense, useMemo } from 'react';
import { useSession } from '@/app/store';
import { detectWebGL } from '@/engine/render/webgl';
import { BUILT_IN_WORLDS } from '@/ui/landing/worlds';
import './world-shell.css';

const WorldStage = lazy(() => import('./WorldStage'));

/**
 * In-world HUD frame. The 3D renderer, legend, and inspector are mounted here in later tasks.
 */
export function WorldShell() {
  const { mode, themeId, setMode, setTheme, returnToMenu } = useSession();
  const world = BUILT_IN_WORLDS.find((w) => w.id === themeId);
  const webgl = useMemo(() => detectWebGL(), []);

  return (
    <div className="world-shell" data-theme={themeId}>
      <header className="hud-bar">
        <button type="button" className="hud-button" onClick={returnToMenu}>
          ← Menu
        </button>
        <div className="hud-title">
          <span className="hud-title__brand">CloudWorld</span>
          <span className="hud-title__world">{world?.name ?? 'Custom world'}</span>
        </div>
        <div className="hud-group" role="group" aria-label="Game mode">
          {(['explorer', 'defender'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`hud-button${mode === m ? ' is-active' : ''}`}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === 'explorer' ? 'Explorer' : 'Defender'}
            </button>
          ))}
        </div>
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
    </div>
  );
}
