# Requirements — ThemeComposer

Modern City, Haunted World, deterministic custom themes, and region/AZ visual variation, built from
reusable procedural kits and GLB assets.

## R1 Built-in worlds

- R1.1 Modern City SHALL be a dense isometric night city: varied towers with lit windows, streets, intersections, vehicles, trees, street lights, shadows, and restrained glow.
- R1.2 Haunted World SHALL use a separate kit: gothic mansions and towers, graveyards, iron fences, pumpkins, crooked trees, fog, and warm orange window light. It SHALL NOT be a recolour of the city.
- R1.3 Both worlds SHALL render every registry resource with a recognizable landmark or the kit's generic landmark.

## R2 Theme independence

- R2.1 Switching themes SHALL NOT change resource IDs, edges, selection, findings, or score.
- R2.2 A theme SHALL be a serializable `ThemeDescriptor`; renderer code SHALL read only the descriptor and kit.

## R3 Region and AZ variation

- R3.1 Each region SHALL receive a clearly different accent palette derived deterministically from the base theme and region name.
- R3.2 Each AZ SHALL receive a subtle variation (tint, light warmth, vegetation, fog density) within its region.
- R3.3 Variation SHALL be stable across reloads and theme re-selection.
- R3.4 Region and AZ boundaries SHALL also be labelled so colour is not the only cue.

## R4 Create World

- R4.1 The user SHALL enter a description and get a theme composed from a documented vocabulary: architecture, biome, weather, time of day, palette, glow.
- R4.2 The same prompt SHALL always produce the same theme (stable seed).
- R4.3 The UI SHALL show recognized terms and SHALL explain unsupported terms with suggestions.
- R4.4 IF nothing in the prompt is recognized THEN no theme SHALL be generated and guidance SHALL be shown.
- R4.5 "Create a futuristic snowy city with glowing blue skyscrapers" SHALL produce a supported theme.
- R4.6 Saved themes SHALL persist in localStorage as versioned descriptors with a small preview, and SHALL be re-openable and deletable.
- R4.7 Corrupted or outdated stored data SHALL be ignored or migrated without crashing.

## R5 Extensibility

- R5.1 A Kiro Skill SHALL document how to add and validate a theme.
- R5.2 A theme validation script SHALL check descriptor schema, kit completeness, and asset paths.

## Out of scope

Runtime LLM generation, user-uploaded models, arbitrary procedural biomes outside the vocabulary.
