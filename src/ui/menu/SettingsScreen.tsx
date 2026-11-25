import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DEFAULT_SETTINGS } from '@/app/settings';
import { useSession } from '@/app/store';
import { WorldPreviewArt } from '@/ui/landing/WorldPreviewArt';
import { ALL_WORLDS } from '@/themes/worlds';
import { MISSIONS } from './missions';
import { BackIcon, LockIcon } from './icons';
import { MenuBackground } from './MenuBackground';
import './menu.css';

export function SettingsScreen() {
  const goTo = useSession((s) => s.goTo);
  const settings = useSession((s) => s.settings);
  const updateSettings = useSession((s) => s.updateSettings);
  const [savedNote, setSavedNote] = useState('');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const save = (patch: Parameters<typeof updateSettings>[0], note: string) => {
    updateSettings(patch);
    setSavedNote(note);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSavedNote(''), 2500);
  };

  return (
    <main className="menu-screen settings-screen">
      <MenuBackground />
      <header className="menu-header">
        <button type="button" className="back-button" onClick={() => goTo('title')}>
          <BackIcon /> Back
        </button>
        <div className="menu-header__titles">
          <p className="menu-kicker">Settings</p>
          <h1>Make it yours</h1>
          <p className="menu-sub">Your favourites are saved on this device and pre-selected next time.</p>
        </div>
        <p className="saved-note" role="status" aria-live="polite">
          {savedNote}
        </p>
      </header>

      <div className="settings-body">
        <section aria-labelledby="set-world">
          <h2 id="set-world" className="settings-label">
            Default world
          </h2>
          <div className="choice-grid" role="radiogroup" aria-labelledby="set-world">
            {ALL_WORLDS.map((w) => {
              const active = settings.defaultWorld === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={w.available ? w.name : `${w.name} (coming soon)`}
                  disabled={!w.available}
                  className={`choice-card${active ? ' is-active' : ''}${w.available ? '' : ' is-locked'}`}
                  style={{ '--accent': w.accent } as CSSProperties}
                  onClick={() => save({ defaultWorld: w.id }, `${w.name} is now your default world.`)}
                >
                  <span className="choice-card__art">
                    <WorldPreviewArt themeId={w.id} />
                    {!w.available && (
                      <span className="world-tile__lock">
                        <LockIcon />
                        <span>Coming soon</span>
                      </span>
                    )}
                  </span>
                  <span className="choice-card__name">{w.name}</span>
                  <span className="choice-card__sub">{w.blurb}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="set-mission">
          <h2 id="set-mission" className="settings-label">
            Default mission
          </h2>
          <div className="choice-grid choice-grid--two" role="radiogroup" aria-labelledby="set-mission">
            {MISSIONS.map((m) => {
              const active = settings.defaultMission === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`choice-card choice-card--text${active ? ' is-active' : ''}`}
                  onClick={() => save({ defaultMission: m.id }, `${m.name} is now your default mission.`)}
                >
                  <span className="choice-card__name">{m.name}</span>
                  <span className="choice-card__sub">{m.tagline}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="settings-actions">
          <button
            type="button"
            className="link-button"
            onClick={() =>
              save(
                {
                  defaultWorld: DEFAULT_SETTINGS.defaultWorld,
                  defaultMission: DEFAULT_SETTINGS.defaultMission,
                },
                'Back to the original defaults.',
              )
            }
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </main>
  );
}
