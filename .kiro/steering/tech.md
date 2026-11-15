# Technology

- Package manager: **npm** (pnpm is not used). Node >= 22.
- React 19, TypeScript ~6.0 (strict; typescript-eslint does not yet support 7.x), Vite 8.
- Three.js, React Three Fiber 9, Drei 10, `@react-three/postprocessing`.
- State: Zustand. Validation at trust boundaries (imported JSON, localStorage): Zod.
- Tests: Vitest + Testing Library (unit/component), Playwright (e2e, smoke, screenshots).
- Lint/format: ESLint flat config + Prettier.

## Commands

| Purpose                                 | Command                                                  |
| --------------------------------------- | -------------------------------------------------------- |
| Dev server (run manually, long-running) | `npm run dev`                                            |
| Fast checks                             | `npm run validate` (typecheck + lint + unit)             |
| Unit tests                              | `npm test`                                               |
| E2E (builds + serves `/CloudWorld/`)    | `npm run test:e2e`                                       |
| Production build                        | `npm run build`                                          |
| Milestone screenshot                    | `node scripts/capture.mjs <url> .screenshots/<name>.png` |

## Conventions

- Use `import.meta.env.BASE_URL` for runtime asset URLs. Never hard-code a leading `/`.
- Use `@/` imports for `src/`.
- Type-only imports use `import type`.
- Do not log plan contents. `console.log` is disallowed by lint.
- New dependencies need a clear reason; prefer small, well-maintained packages. Keep `npm audit` clean.

## Performance

- Reuse geometries and materials; instance repeated props; lazy-load theme kits and GLBs.
- Use adaptive DPR / `PerformanceMonitor`. Do not gate CI on FPS.
- Keep draw calls in the low hundreds for the bundled sample.

## MCP servers (development only)

- **Blender** — create/refine assets, export GLBs. Never a runtime dependency.
- **Playwright** — inspect the running app. Its MCP server expects Google Chrome; if Chrome is missing,
  use `scripts/capture.mjs` (bundled Playwright Chromium) for screenshots.
- **Terraform** — look up `hashicorp/aws` resource schemas and argument names for the registry.
