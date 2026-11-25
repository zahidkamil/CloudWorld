# CloudWorld Progress

Source of truth for task status. Detailed subtasks live in `.kiro/specs/*/tasks.md`.

| #   | Task                                                         | Status  |
| --- | ------------------------------------------------------------ | ------- |
| 1   | Executable project and Kiro source of truth                  | ✅ Done |
| 2   | Terraform ingestion, topology resolution, graph inspector    | ✅ Done |
| 3   | Multi-region 3D vertical slice and early Pages build         | —       |
| 4   | Expanded AWS registry, legend, shared highlighting           | —       |
| 5   | World library system and Modern City (Blender MCP models)    | —       |
| 6   | Haunted World library (Blender MCP models)                   | —       |
| 7   | Game interface and synchronized navigation                   | —       |
| 8   | Region/AZ variation and saved themes                         | —       |
| 9   | Defender rules                                               | —       |
| 10  | Guided Defender mission and Explorer polish                  | —       |
| 11  | Aqua world, built with the `create-world` Kiro Workflow      | —       |
| 12  | Production validation, docs, deployment                      | —       |
| 13  | Create World with an LLM key (DEFERRED, likely out of scope) | —       |

World instruction sets (`worlds/modern-city`, `haunted-world`, `aqua-world`), the `create-cloudworld-world` Skill,
the `world-builder` agent and the `create-world` Kiro Workflow are written. Models are still `planned`; they are built in Tasks 5, 6 and 11.

## Cross-browser coverage

`npm run test:e2e` runs every functional test on Chromium, Firefox, and WebKit (21 tests at Task 1):
WebGL 2 availability, Three.js frame rendering (frames, draw calls, triangles), theme switching,
navigation and mode state, and camera drag. Only `@visual` pixel baselines are Chromium-only.

## Start menu and Attack Path (added after Task 2)

Start menu (World, Settings), world select, mission picker, saved defaults, locked Aqua card, and the Attack Path panel with a first real
rule (open sensitive ports) are done. Attack paths across resources, more rules, and 3D finding markers stay in Task 9.
Hooks added: visual review (Playwright MCP), Blender model review (Blender MCP), GLB validation on save. The `create-world` workflow now takes
a plain description and deduces the world name.

## Notes

- Reference images: `docs/images/City-Theme.jpeg`, `Haunted-Theme.jpeg`, `Aqua-Theme.png`, `Game.png`. Images are optional for new worlds (a written brief works).
- Playwright MCP needs Google Chrome installed (`chrome` channel). Until then, screenshots use
  `scripts/capture.mjs` with Playwright's bundled Chromium.
- `minimatch` is overridden to `^11.0.8` to clear GHSA-g3hv-75wg-m249 in typescript-eslint's dev dependency.
- The world screen currently shows a placeholder diorama; Task 3 replaces it with the graph-driven world.
