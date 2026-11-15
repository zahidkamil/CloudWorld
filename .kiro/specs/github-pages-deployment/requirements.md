# Requirements — GitHub Pages Deployment

Static hosting at `https://zahidkamil.github.io/CloudWorld/`, CI quality gates, and production testing.

## R1 Static hosting

- R1.1 The production build SHALL be fully static and served under `/CloudWorld/`.
- R1.2 All assets (JS, CSS, GLB, previews, samples) SHALL resolve under the base path, including after reload.
- R1.3 The site SHALL make no runtime API calls and require no installs, credentials, or backend.

## R2 Pull request checks (target: `main`)

- R2.1 TypeScript typecheck and ESLint.
- R2.2 Unit tests (Vitest).
- R2.3 Playwright end-to-end tests SHALL run the full functional suite on Chromium, Firefox, and WebKit, covering WebGL 2 initialization, Three.js frame rendering, theme selection, navigation, camera interaction, and Explorer/Defender gameplay as it lands. Only `@visual` pixel baselines are Chromium-only.
- R2.4 Dependency review for newly introduced vulnerable packages, plus `npm audit` at high severity.
- R2.5 Secret scanning of the diff/history (gitleaks).
- R2.6 Static code analysis (CodeQL for JavaScript/TypeScript).
- R2.7 Production build verification and asset validation scripts.
- R2.8 FPS or other performance measurements in software-rendered CI SHALL NOT block merges.

## R3 Deployment from `main`

- R3.1 Pushes to `main` SHALL rerun the required checks before building the Pages artifact.
- R3.2 Deployment SHALL use `actions/upload-pages-artifact` and `actions/deploy-pages` with job-level least-privilege permissions.
- R3.3 After deployment, a smoke test SHALL load the live URL and verify the landing screen and one world.

## R4 Browser compatibility

- R4.1 Current desktop Chrome, Edge, Firefox, and Safari SHALL be supported.
- R4.2 Visual screenshot baselines SHALL be maintained for Chromium only, generated in CI's Linux environment.

## R5 Safety

- R5.1 Workflows SHALL pin third-party actions to commit SHAs where practical.
- R5.2 Enabling Pages, changing repository settings, and pushing SHALL require the owner's approval.
