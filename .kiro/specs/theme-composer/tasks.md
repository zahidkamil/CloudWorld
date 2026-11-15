# Tasks — ThemeComposer and World Libraries

- [x] 1. World instruction-set libraries
  - [x] 1.1 `worlds/` layout, `_template`, `modern-city` and `haunted-world` instruction sets with reference image names
  - [x] 1.2 `scripts/validate-worlds.mjs`, `npm run validate:worlds`, save hook
  - [x] 1.3 `create-cloudworld-world` Skill, `world-builder` agent, `create-world` Kiro Workflow, Aqua instruction set
  - _Requirements: R1.1–R1.3, R1.6_

- [ ] 3. Theme contract
  - [ ] 3.1 ThemeDescriptor and library.json Zod schemas, `resolve()` with fallbacks (tests)
  - [ ] 3.2 Region palette and AZ variant derivation (tests)
  - _Requirements: R1.4, R3.2, R4_

- [ ] 5. Modern City library
  - [ ] 5.1 Library loader, instancing, procedural fallbacks, shared kit pieces (roads, trees, lamps, vehicles)
  - [ ] 5.2 Blender MCP: build structure, family, and key-service models from `worlds/modern-city/resources.md`; export GLBs
  - [ ] 5.3 `library.json`, day and night presets, screenshot review against `docs/images/City-Theme.jpeg`
  - _Requirements: R1, R2.1, R2.3, R2.4_

- [ ] 6. Haunted World library
  - [ ] 6.1 Blender MCP: build models from `worlds/haunted-world/resources.md`; export GLBs
  - [ ] 6.2 `library.json`, fog, ghost light, bloom; screenshot review against `docs/images/Haunted-Theme.jpeg`
  - [ ] 6.3 Theme independence tests (graph, selection, findings unchanged)
  - _Requirements: R2.2, R2.3, R3_

- [ ] 8. Saved themes
  - [ ] 8.1 Versioned storage with migration and corruption tests
  - [ ] 8.2 Saved theme cards and delete (UI in Game Interface spec)
  - _Requirements: R5_

- [ ] 11. Aqua world, built with the Kiro Workflow
  - [x] 11.0 Aqua instruction set written (`worlds/aqua-world/`, reference `docs/images/Aqua-Theme.png`); `world-builder` agent and `create-world` workflow added
  - [ ] 11.1 Run the `create-world` workflow for Aqua (models, library.json, registration, verification)
  - [ ] 11.2 Fix any workflow gaps found and update the Skill and recipe
  - _Requirements: R1.5, R1.6, R1.8_

- [ ] 13. Create World with an LLM (DEFERRED: probably not part of the hackathon submission)
  - [ ] 13.1 Re-read the current OpenAI and Anthropic API docs; confirm browser access, headers, and structured output formats
  - [ ] 13.2 Key entry UI, provider clients, schema, Zod validation, error mapping, mocked-fetch tests
  - [ ] 13.3 Live check with real keys; document limits
  - _Requirements: R6_
