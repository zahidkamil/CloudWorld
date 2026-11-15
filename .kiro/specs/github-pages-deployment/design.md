# Design — GitHub Pages Deployment

## Build

- `vite.config.ts` sets `base: '/CloudWorld/'`.
- Runtime asset URLs use `import.meta.env.BASE_URL` (never a leading `/`).
- Single-page app with in-memory screen state, so no 404 fallback routing is needed.

## Workflows

`.github/workflows/ci.yml` (on `pull_request` to `main`, and `workflow_call`):

| Job      | Steps                                                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| quality  | `npm ci`, typecheck, lint, format check, unit tests, build, asset/theme validation                                            |
| e2e      | Playwright container image; matrix over chromium, firefox, webkit running the full functional suite (`@visual` Chromium-only) |
| security | dependency-review-action (PR only), `npm audit --audit-level=high`, gitleaks                                                  |
| codeql   | CodeQL javascript-typescript analysis                                                                                         |

`.github/workflows/deploy.yml` (on `push` to `main`, `workflow_dispatch`):

1. `checks`: `uses: ./.github/workflows/ci.yml`.
2. `build`: `npm ci`, `npm run build`, `actions/configure-pages`, `actions/upload-pages-artifact` with `dist`.
3. `deploy`: `environment: github-pages`, permissions `pages: write`, `id-token: write`, `actions/deploy-pages`.
4. `smoke`: Playwright `@smoke` against `PLAYWRIGHT_BASE_URL` = deployed URL.

Top-level `permissions: contents: read`; elevated permissions only on the jobs that need them.
`concurrency: pages` without cancelling an in-progress deployment.

Rendering verification: `WorldCanvas` publishes `data-ready`, `data-frames`, `data-draw-calls`,
`data-triangles`, and `data-webgl` on its wrapper so tests can assert that Three.js drew real frames in
every engine without relying on pixel baselines.

## Local equivalents

`npm run validate` (typecheck + lint + unit) and `npm run test:e2e` (builds and serves `/CloudWorld/` via `vite preview`).
Kiro hooks run the fast subset on file save.

## Manual setup (owner)

Repository Settings -> Pages -> Source: GitHub Actions. Enable Dependabot alerts and secret scanning.
