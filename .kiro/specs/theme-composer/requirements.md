# Requirements — ThemeComposer and World Libraries

Worlds are data-driven libraries: Modern City, Haunted World, and later worlds such as Aqua. Each has an
instruction-set folder, Blender-made GLB models, and a `library.json`. ThemeComposer turns a library plus
settings into a `ThemeDescriptor` and adds region and AZ variation.

## R1 World libraries

- R1.1 Each world SHALL live in `worlds/<id>/` (`world.md`, `resources.md`) and `public/worlds/<id>/` (`library.json`, `models/*.glb`, `preview.webp`).
- R1.2 A reference image SHALL be optional. If `world.md` lists reference images (file names under `docs/images/`), validation SHALL fail when a listed file is missing. A world with no image SHALL provide a written `brief:` instead.
- R1.3 `resources.md` SHALL describe how each AWS resource looks as a list of entries: 4 `structure:*`, 12 `family:*`, and about 10 key services (EC2, S3, RDS, Lambda, load balancer, NAT, internet gateway, security group, IAM role, KMS).
- R1.4 Resource lookup SHALL be: service key, then family key, then `family:generic`, then a procedural fallback shape.
- R1.5 The renderer SHALL contain no world-specific code. A new world SHALL be added by adding folders and registering it in the world list.
- R1.6 A Kiro Skill (`create-cloudworld-world`) SHALL document the workflow: reference image, resource list, Blender MCP model build, export, `library.json`, screenshot verification.
- R1.8 A Kiro Workflow (`.kiro/workflows/create-world.workflow.json`) and custom agent (`world-builder`) SHALL let agents run the world creation steps, pausing for user review of the resource list.
- R1.7 Blender SHALL be development-only. Optimized GLBs SHALL be under 150 KB each and 3 MB per world.

## R2 Built-in worlds

- R2.1 Modern City SHALL follow `docs/images/City-Theme.jpeg`: bright isometric city slab with pastel stone towers, blossom and round trees, river and stone bridge, roads, crosswalks, small vehicles. A night lighting preset SHALL reuse the same models.
- R2.2 Haunted World SHALL follow `docs/images/Haunted-Theme.jpeg`: hand-painted gothic courtyard with blue slate roofs, cobblestone, glowing arched windows, pumpkins, candles, tombstones, chain fence, banner, angel statue, ghost wisps, fog.
- R2.5 Aqua World SHALL follow `docs/images/Aqua-Theme.png` (glass domes, boardwalks, reef islands, sea life) and SHALL be built through the workflow in Task 11.
- R2.3 The two worlds SHALL differ in geometry, materials, lighting, and props. Neither SHALL be a recolour of the other.
- R2.4 Both SHALL render every registry resource with a model or fallback.

## R3 Theme independence

- R3.1 Switching worlds SHALL NOT change resource IDs, edges, selection, findings, or score.
- R3.2 A theme SHALL be a serializable `ThemeDescriptor`; renderer code SHALL read only the descriptor and library.

## R4 Region and AZ variation

- R4.1 Each region SHALL receive a clearly different accent palette derived deterministically from the world palette and region name.
- R4.2 Each AZ SHALL receive a subtle variation (tint, light warmth, vegetation or prop density, fog density).
- R4.3 Variation SHALL be stable across reloads and world switching.
- R4.4 Regions and AZs SHALL be labelled so colour is not the only cue.

## R5 Saved themes

- R5.1 Custom themes SHALL be saved in localStorage as versioned descriptors with a small preview, re-openable and deletable.
- R5.2 Corrupted or outdated stored data SHALL be ignored or migrated without crashing.

## R6 Create World with an LLM (DEFERRED, probably not in the hackathon submission)

- R6.1 The in-app Create World UI SHALL NOT be shown unless the user enters an OpenAI or Anthropic API key.
- R6.2 The key SHALL stay in memory by default (optional sessionStorage), SHALL be sent only to the chosen provider, and SHALL NOT be logged, saved to localStorage, or included in saved themes.
- R6.3 The provider SHALL return JSON constrained by a schema. The app SHALL validate it with Zod, reject unknown libraries, and only compose from existing world libraries and the descriptor vocabulary.
- R6.4 Unsupported requests (for example a brand-new world needing new 3D models) SHALL be explained, with a pointer to the `create-cloudworld-world` workflow.
- R6.5 Provider failures (bad key, rate limit, network, CORS, refusal, invalid JSON) SHALL show clear messages and leave the current world unchanged.
- R6.6 Calls SHALL follow each provider's current API docs, verified against the live API before release.

## Out of scope

Runtime generation of 3D models, user-uploaded models, backend proxies, key storage on a server.
