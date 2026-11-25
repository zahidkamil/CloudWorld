import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useSession } from '@/app/store';
import { WorldPreviewArt } from '@/ui/landing/WorldPreviewArt';
import { ALL_WORLDS, type WorldCardInfo } from '@/themes/worlds';
import { MISSIONS } from './missions';
import { BackIcon, LockIcon, StarIcon } from './icons';
import { MenuBackground } from './MenuBackground';
import './menu.css';

function MissionPicker({ world, onClose }: { world: WorldCardInfo; onClose: () => void }) {
  const enterWorld = useSession((s) => s.enterWorld);
  const defaultMission = useSession((s) => s.settings.defaultMission);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.querySelector<HTMLElement>('button.mission-card')?.focus();
    // Handled on the document because Safari does not focus buttons on click.
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="mission-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="mission-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-title"
        ref={ref}
        style={{ '--accent': world.accent } as CSSProperties}
      >
        <div className="mission-dialog__art">
          <WorldPreviewArt themeId={world.id} />
        </div>
        <div className="mission-dialog__body">
          <p className="menu-kicker">{world.name}</p>
          <h2 id="mission-title">Choose your mission</h2>
          <div className="mission-grid">
            {MISSIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`mission-card mission-card--${m.id}`}
                onClick={() => enterWorld(world.id, m.id)}
              >
                <span className="mission-card__top">
                  <strong>{m.name}</strong>
                  {m.id === defaultMission && <span className="badge">Your default</span>}
                </span>
                <span className="mission-card__tagline">{m.tagline}</span>
                <span className="mission-card__perks">
                  {m.perks.map((p) => (
                    <span key={p}>{p}</span>
                  ))}
                </span>
                <span className="mission-card__go">{m.start} ›</span>
              </button>
            ))}
          </div>
          <button type="button" className="link-button" onClick={onClose}>
            Back to worlds
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorldSelect() {
  const goTo = useSession((s) => s.goTo);
  const graph = useSession((s) => s.graph);
  const openImport = useSession((s) => s.openImport);
  const defaultWorld = useSession((s) => s.settings.defaultWorld);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = ALL_WORLDS.find((w) => w.id === pickedId && w.available);

  return (
    <main className="menu-screen select-screen">
      <MenuBackground />
      <header className="menu-header">
        <button type="button" className="back-button" onClick={() => goTo('title')}>
          <BackIcon /> Back
        </button>
        <div className="menu-header__titles">
          <p className="menu-kicker">World select</p>
          <h1>Choose your world</h1>
          <p className="menu-sub">Where should your cloud come to life?</p>
        </div>
        <div className="plan-chip">
          <span className={`status-dot${graph ? ' is-on' : ''}`} aria-hidden="true" />
          <span>{graph ? `${graph.resources.length} resources loaded` : 'No plan loaded'}</span>
          <button type="button" className="link-button" onClick={openImport}>
            {graph ? 'Change plan' : 'Load a Terraform plan'}
          </button>
        </div>
      </header>

      <ul className="world-tiles">
        {ALL_WORLDS.map((world) => (
          <li key={world.id}>
            <button
              type="button"
              className={`world-tile${world.available ? '' : ' is-locked'}`}
              style={{ '--accent': world.accent } as CSSProperties}
              disabled={!world.available}
              onClick={() => setPickedId(world.id)}
              aria-label={`${world.name}. ${world.available ? world.tagline : 'Coming soon'}`}
            >
              <span className="world-tile__art">
                <WorldPreviewArt themeId={world.id} />
                {!world.available && (
                  <span className="world-tile__lock">
                    <LockIcon />
                    <span>Coming soon</span>
                  </span>
                )}
                {world.id === defaultWorld && (
                  <span className="badge badge--star">
                    <StarIcon /> Default
                  </span>
                )}
              </span>
              <span className="world-tile__body">
                <span className="world-tile__name">{world.name}</span>
                <span className="world-tile__tagline">{world.tagline}</span>
                <span className="world-tile__blurb">{world.blurb}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {picked && <MissionPicker world={picked} onClose={() => setPickedId(null)} />}
    </main>
  );
}
