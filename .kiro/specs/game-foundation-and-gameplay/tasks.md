# Tasks — Game Foundation and Gameplay

Task numbers map to the global sequence in `docs/PROGRESS.md`.

- [x] 1. Project foundation
  - [x] 1.1 Scaffold Vite + React + strict TypeScript, ESLint, Prettier, Vitest, Playwright
  - [x] 1.2 Create engine/app/ui directory conventions and session store
  - _Requirements: all (foundation)_

- [ ] 2. Terraform ingestion and topology
  - [ ] 2.1 Write parser tests (root, nested modules, count/for_each, unknowns, invalid, unsupported version, sensitive values)
  - [ ] 2.2 Implement plan parser and sanitizer
  - [ ] 2.3 Implement edge extraction and shared dependency groups
  - [ ] 2.4 Implement topology resolver (region, AZ, global, unresolved) with tests
  - [ ] 2.5 Author multi-region sample plan (provider aliases, 2 regions, 3+ AZs, modules, count, for_each, shared SGs)
  - [ ] 2.6 Import flow: sample / upload / paste, preview, confirm, failure recovery, temporary inspector
  - _Requirements: R1, R2.1, R3_

- [ ] 3. Multi-region 3D vertical slice
  - [ ] 3.1 Deterministic layout for global hub, region islands, AZ districts (tests)
  - [ ] 3.2 Shared R3F scene, isometric camera, controls, hover, select, click-to-focus
  - [ ] 3.3 Inspector panel
  - _Requirements: R3, R4.1, R5.1, R5.2_

- [ ] 4. Expanded registry and shared highlighting
  - [ ] 4.1 Verify schemas/relationship fields with Terraform MCP; build tiered registry with validation tests
  - [ ] 4.2 Highlight controller: primary, dependency, shared peer, type, dimmed
  - _Requirements: R2.2–R2.4, R4_

- [ ] 9. Defender rules
  - [ ] 9.1 Rule fixtures (positive, negative, partial data) and rule implementations
  - [ ] 9.2 Attack-path search, finding markers, remediation cards, deterministic scoring
  - _Requirements: R6.1–R6.3_

- [ ] 10. Guided mission and Explorer polish
  - [ ] 10.1 Curated vulnerable scenario and guided mission flow
  - [ ] 10.2 Relationship tracing from the inspector, category filters
  - _Requirements: R5.3, R6.4_
