# Tasks — GitHub Pages Deployment

- [x] 1. Base path and local production preview
  - [x] 1.1 `base: '/CloudWorld/'`, Playwright webServer serving the production build under the base path
  - [x] 1.2 Cross-engine suite (Chromium, Firefox, WebKit): WebGL 2, Three.js frames, theme switch, navigation, camera drag
  - _Requirements: R1.1, R1.2, R2.3, R4.1_

- [ ] 3. Early deployment
  - [ ] 3.1 `ci.yml` with quality, e2e, security, and CodeQL jobs
  - [ ] 3.2 `deploy.yml` reusing CI, building and deploying the Pages artifact
  - [ ] 3.3 Owner enables Pages (Source: GitHub Actions); first deploy after approval
  - _Requirements: R2, R3.1, R3.2, R5_

- [ ] 12. Release hardening
  - [ ] 12.1 Post-deploy smoke test against the live URL
  - [ ] 12.2 Chromium screenshot baselines generated in CI container
  - [ ] 12.3 Asset path checks for `public/worlds/*`, `validate:worlds` in CI, and no-network-call checks (LLM calls only after a key is entered)
  - [ ] 12.4 Final docs: README, extension guide, known limits
  - _Requirements: R1.3, R3.3, R4_
