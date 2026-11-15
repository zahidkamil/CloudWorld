# CloudWorld Progress

Source of truth for task status. Detailed subtasks live in `.kiro/specs/*/tasks.md`.

| #   | Task                                                      | Status         |
| --- | --------------------------------------------------------- | -------------- |
| 1   | Executable project and Kiro source of truth               | ✅ Done        |
| 2   | Terraform ingestion, topology resolution, graph inspector | 🚧 In progress |
| 3   | Multi-region 3D vertical slice and early Pages build      | —              |
| 4   | Expanded AWS registry, legend, shared highlighting        | —              |
| 5   | Modern City visual milestone and asset workflow           | —              |
| 6   | Haunted World and theme independence                      | —              |
| 7   | Game interface and synchronized navigation                | —              |
| 8   | ThemeComposer and saved worlds                            | —              |
| 9   | Defender rules                                            | —              |
| 10  | Guided Defender mission and Explorer polish               | —              |
| 11  | Production validation, docs, deployment                   | —              |

## Cross-browser coverage

`npm run test:e2e` runs every functional test on Chromium, Firefox, and WebKit (21 tests at Task 1):
WebGL 2 availability, Three.js frame rendering (frames, draw calls, triangles), theme switching,
navigation and mode state, and camera drag. Only `@visual` pixel baselines are Chromium-only.

## Notes

- Playwright MCP needs Google Chrome installed (`chrome` channel). Until then, screenshots use
  `scripts/capture.mjs` with Playwright's bundled Chromium.
- `minimatch` is overridden to `^11.0.8` to clear GHSA-g3hv-75wg-m249 in typescript-eslint's dev dependency.
- The world screen currently shows a placeholder diorama; Task 3 replaces it with the graph-driven world.
