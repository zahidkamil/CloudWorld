import { useState, type CSSProperties } from 'react';
import { useSession, type GameMode } from '@/app/store';
import { WorldPreviewArt } from './WorldPreviewArt';
import { BUILT_IN_WORLDS } from './worlds';
import './landing.css';

const MODES: { id: GameMode; label: string; description: string }[] = [
  { id: 'explorer', label: 'Explorer', description: 'Walk your infrastructure and trace relationships' },
  { id: 'defender', label: 'Defender', description: 'Find attack paths and choose remediations' },
];

export function Landing() {
  const enterWorld = useSession((s) => s.enterWorld);
  const [mode, setMode] = useState<GameMode>('explorer');
  const [prompt, setPrompt] = useState('');

  return (
    <main className="landing">
      <div className="landing__sky" aria-hidden="true" />
      <div className="landing__panel">
        <header className="landing__header">
          <div>
            <h1 className="landing__title">CloudWorld</h1>
            <p className="landing__kicker">Build · Explore · Defend</p>
          </div>
          <p className="landing__pitch">
            Turn AWS Terraform plans into living 3D worlds. Explore how your infrastructure connects, then
            defend it from attack paths.
          </p>
        </header>

        <section aria-labelledby="mode-heading" className="landing__section">
          <h2 id="mode-heading" className="landing__label">
            Choose your game
          </h2>
          <div className="mode-picker" role="radiogroup" aria-labelledby="mode-heading">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                className={`mode-picker__option${mode === m.id ? ' is-active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                <span className="mode-picker__name">{m.label}</span>
                <span className="mode-picker__desc">{m.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="world-heading" className="landing__section">
          <h2 id="world-heading" className="landing__label">
            Choose your world
          </h2>
          <ul className="world-grid">
            {BUILT_IN_WORLDS.map((world) => (
              <li key={world.id}>
                <button
                  type="button"
                  className="world-card"
                  style={{ '--accent': world.accent } as CSSProperties}
                  onClick={() => enterWorld(world.id, mode)}
                  aria-label={`Enter ${world.name} in ${mode === 'explorer' ? 'Explorer' : 'Defender'} mode`}
                >
                  <div className="world-card__preview">
                    <WorldPreviewArt themeId={world.id} />
                  </div>
                  <div className="world-card__body">
                    <span className="world-card__name">{world.name}</span>
                    <span className="world-card__tagline">{world.tagline}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="create-heading" className="landing__section create-world">
          <h2 id="create-heading" className="create-world__title">
            <span aria-hidden="true">✦</span> Create your own world
          </h2>
          <p className="create-world__hint">Describe the environment you want to explore.</p>
          <form className="create-world__form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="world-prompt" className="visually-hidden">
              World description
            </label>
            <input
              id="world-prompt"
              className="create-world__input"
              placeholder="A futuristic snowy city with glowing blue skyscrapers…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button type="submit" className="create-world__button" disabled>
              Generate World
            </button>
          </form>
          <p className="create-world__note">ThemeComposer is coming soon.</p>
        </section>

        <footer className="landing__footer">
          Runs entirely in your browser. No AWS credentials, backend, or installs required.
        </footer>
      </div>
    </main>
  );
}
