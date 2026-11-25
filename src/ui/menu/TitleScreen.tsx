import { useSession } from '@/app/store';
import { WorldPreviewArt } from '@/ui/landing/WorldPreviewArt';
import { worldById } from '@/themes/worlds';
import { missionById } from './missions';
import { GlobeIcon, GearIcon } from './icons';
import { MenuBackground } from './MenuBackground';
import './menu.css';

export function TitleScreen() {
  const goTo = useSession((s) => s.goTo);
  const enterWorld = useSession((s) => s.enterWorld);
  const settings = useSession((s) => s.settings);
  const graph = useSession((s) => s.graph);
  const openImport = useSession((s) => s.openImport);
  const quickWorld = worldById(settings.defaultWorld);
  const quickMission = missionById(settings.defaultMission);

  return (
    <main className="menu-screen title-screen">
      <MenuBackground />
      <div className="title-art title-art--left" aria-hidden="true">
        <WorldPreviewArt themeId="modern-city" />
      </div>
      <div className="title-art title-art--right" aria-hidden="true">
        <WorldPreviewArt themeId="haunted-world" />
      </div>

      <div className="title-center">
        <p className="title-kicker">Build · Explore · Defend</p>
        <h1 className="title-logo">CloudWorld</h1>
        <p className="title-tagline">Pick a world. Bring your cloud to life.</p>

        <nav className="title-menu" aria-label="Main menu">
          <button type="button" className="menu-button" onClick={() => goTo('worlds')}>
            <span className="menu-button__icon">
              <GlobeIcon />
            </span>
            <span className="menu-button__text">
              <strong>World</strong>
              <small>Choose a realm and set off</small>
            </span>
            <span className="menu-button__arrow" aria-hidden="true">
              ›
            </span>
          </button>
          <button type="button" className="menu-button menu-button--quiet" onClick={() => goTo('settings')}>
            <span className="menu-button__icon">
              <GearIcon />
            </span>
            <span className="menu-button__text">
              <strong>Settings</strong>
              <small>Choose your favourite world and mission</small>
            </span>
            <span className="menu-button__arrow" aria-hidden="true">
              ›
            </span>
          </button>
        </nav>

        {quickWorld && (
          <button
            type="button"
            className="quick-play"
            onClick={() => enterWorld(settings.defaultWorld, settings.defaultMission)}
          >
            <span className="quick-play__label">Quick play</span>
            <span>
              {quickWorld.name} · {quickMission.name}
            </span>
          </button>
        )}

        <p className="title-status">
          {graph ? (
            <>
              <span className="status-dot is-on" aria-hidden="true" />
              {graph.resources.length} resources loaded.{' '}
              <button type="button" className="link-button" onClick={openImport}>
                Change plan
              </button>
            </>
          ) : (
            <>
              <span className="status-dot" aria-hidden="true" />
              No plan loaded yet. You can load one from the World screen.
            </>
          )}
        </p>
      </div>

      <footer className="menu-footer">
        Runs entirely in your browser. No AWS credentials, backend, or installs required.
      </footer>
    </main>
  );
}
