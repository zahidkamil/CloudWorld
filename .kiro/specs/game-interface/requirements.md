# Requirements — Game Interface

Landing screen, world selection, Create World, in-world HUD, legend, inspector, and import UI.
The interface should feel like a game, not a developer dashboard.

## R1 Landing

- R1.1 The landing screen SHALL show the CloudWorld brand, the Explorer/Defender choice, and world cards laid out like `docs/images/Game.png`.
- R1.4 The Create World prompt SHALL NOT appear unless the user has entered an OpenAI or Anthropic API key (last task).
- R1.2 World cards SHALL show previews captured from the real 3D scenes.
- R1.3 Saved custom worlds, once they exist, SHALL appear as cards after built-in worlds.

## R2 In-world HUD

- R2.1 The HUD SHALL provide return to menu, mode switch, theme switch, help, and plan import.
- R2.2 Switching mode or theme SHALL preserve the loaded graph and, where meaningful, the selection.
- R2.3 Defender SHALL show score and objective progress.

## R3 Resource legend

- R3.1 A collapsible side legend SHALL group resources as category -> resource type (with count) -> instance.
- R3.2 Clicking a resource type SHALL highlight all its instances in the world.
- R3.3 Clicking an instance SHALL select it, focus the camera on it, and highlight dependencies and shared peers.
- R3.4 Hovering legend entries SHALL preview highlights; selecting in the world SHALL expand and scroll the legend to that entry.

## R4 Inspector

- R4.1 Hover SHALL show a compact label; click SHALL open the inspector card.
- R4.2 The inspector SHALL list relationships and shared components as clickable links.

## R5 Import

- R5.1 The import dialog SHALL offer bundled samples, file upload, and paste.
- R5.2 It SHALL show validation results and a preview before an explicit "Load world" action.

## R6 Quality

- R6.1 All DOM controls SHALL be keyboard accessible with visible focus.
- R6.2 Menus SHALL be usable at 390 px width; gameplay targets desktop.
- R6.3 Motion SHALL respect `prefers-reduced-motion`.
- R6.4 IF WebGL is unavailable THEN a clear message SHALL be shown.
