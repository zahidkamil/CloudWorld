/** Shared animated sky for the start menu screens. Motion is disabled by the reduced-motion rule in global.css. */
export function MenuBackground() {
  return (
    <div className="menu-bg" aria-hidden="true">
      <div className="menu-bg__stars" />
      <div className="menu-bg__cloud menu-bg__cloud--a" />
      <div className="menu-bg__cloud menu-bg__cloud--b" />
      <div className="menu-bg__cloud menu-bg__cloud--c" />
      <div className="menu-bg__horizon" />
    </div>
  );
}
