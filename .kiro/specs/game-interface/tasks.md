# Tasks — Game Interface

- [x] 1. Landing shell
  - [x] 1.1 Landing with brand, mode picker, world cards (interim art). Create World panel removed until the BYO-key task
  - [x] 1.2 WorldShell HUD with menu, mode, theme switch; navigation tests and smoke e2e
  - _Requirements: R1.1, R2.1, R6.1, R6.2_

- [x] 1.3 Start menu: World and Settings, world select with mission picker, defaults, Quick play, locked Aqua, Attack Path panel (score, findings caught, hints)
  - _Requirements: R0_

- [x] 2. Import UI
  - [x] 2.1 ImportDialog with sample / upload / paste, PlanPreview, confirm and cancel
  - _Requirements: R5_

- [ ] 3. Inspector
  - [ ] 3.1 Hover label and inspector card with relationship links
  - _Requirements: R4_

- [ ] 4. Legend
  - [x] 4.0 Interim: infrastructure panel groups by type (category, type with counts, instance) or by location, expand/collapse all, resizable by drag and keyboard (width remembered)
  - [ ] 4.1 Collapsible category -> type -> instance tree with counts
  - [ ] 4.1b Full-row hover and focus highlight on every resource row, synced with world hover (shared hoveredId)
  - [ ] 4.2 Type highlight, instance focus, hover preview, reverse sync from world selection
  - [ ] 4.3 Resource nameplates: hover tooltip, selected persistent label, and toggleable all-resource label layer (`Type (name)`)
  - _Requirements: R3_

- [ ] 7. Game interface polish
  - [ ] 7.1 Real world previews on cards, help overlay, WebGL fallback
  - [ ] 7.2 State preservation across mode/theme switches; responsive and keyboard checks
  - _Requirements: R1.2, R2.2, R6_

- [ ] 8. Saved world cards
  - [ ] 8.1 Saved themes appear as cards, with delete
  - _Requirements: R1.3_

- [ ] 13. Create World entry (DEFERRED: probably not part of the hackathon submission)
  - [ ] 13.1 "Create worlds with AI" key entry, provider picker, prompt, result and error states
  - _Requirements: R1.4_
