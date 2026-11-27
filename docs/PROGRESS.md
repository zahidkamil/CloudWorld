# CloudWorld Progress

Source of truth for task status. Detailed subtasks live in `.kiro/specs/*/tasks.md`.

| #   | Task                                                         | Status                      |
| --- | ------------------------------------------------------------ | --------------------------- |
| 1   | Executable project and Kiro source of truth                  | ✅ Done                     |
| 2   | Terraform ingestion, topology resolution, graph inspector    | ✅ Done                     |
| 3   | Multi-region 3D vertical slice and early Pages build         | ✅ Done (awaiting approval) |
| 4   | Expanded AWS registry, legend, shared highlighting           | ✅ Done (awaiting approval) |
| 5   | World library system and Modern City (Blender MCP models)    | ✅ Done (awaiting approval) |
| 6   | Haunted World library (Blender MCP models)                   | ✅ Done (awaiting approval) |
| 7   | Game interface and synchronized navigation                   | —                           |
| 8   | Region/AZ variation and saved themes                         | —                           |
| 9   | Defender rules                                               | —                           |
| 10  | Guided Defender mission and Explorer polish                  | —                           |
| 11  | Aqua world, built with the `create-world` Kiro Workflow      | —                           |
| 12  | Production validation, docs, deployment                      | —                           |
| 13  | Create World with an LLM key (DEFERRED, likely out of scope) | —                           |

World instruction sets (`worlds/modern-city`, `haunted-world`, `aqua-world`), the `create-cloudworld-world` Skill,
the `world-builder` agent and the `create-world` Kiro Workflow are written. Modern City and Haunted World are `built`; Aqua is built in Task 11.

## Cross-browser coverage

`npm run test:e2e` runs every functional test on Chromium, Firefox, and WebKit (21 tests at Task 1):
WebGL 2 availability, Three.js frame rendering (frames, draw calls, triangles), theme switching,
navigation and mode state, and camera drag. Only `@visual` pixel baselines are Chromium-only.

## Start menu and Attack Path (added after Task 2)

Start menu (World, Settings), world select, mission picker, saved defaults, locked Aqua card, and the Attack Path panel with a first real
rule (open sensitive ports) are done. Attack paths across resources, more rules, and 3D finding markers stay in Task 9.
Hooks added: visual review (Playwright MCP), Blender model review (Blender MCP), GLB validation on save. The `create-world` workflow now takes
a plain description and deduces the world name.

## Tasks 5 and 6 summary

- Both worlds are original Blender MCP libraries built from scripts (`worlds/<id>/blender/build_library.py`) on a shared kit
  (`worlds/_shared/blender/cw_kit.py`): Blender Z up exported +Y up (no rotation in the app), three materials (vertex-coloured
  `paint`, `glow`, `neon`) joined per material, Draco with the decoder self-hosted in `public/draco/`.
- **Modern City** is a Manhattan-style downtown: 31 GLBs (264 KB). EC2 is sized by `instance_type`: walk-up (nano/micro), limestone
  mid-rise (small/medium), art-deco skyscraper (large/xlarge), glass supertall (2xlarge+). RDS is a copper-domed rotunda, DynamoDB a
  tank refinery, Lambda a food truck, the load balancer a Times-Square junction. Props: yellow cabs, food carts, cafés, shop rows.
- **Haunted World** is a vampire estate: 32 GLBs. EC2 grows from a crooked cottage to a Victorian house, a gated manor and Dracula's
  castle. RDS is a round moon crypt, DynamoDB a cauldron brewery, the internet gateway a castle gatehouse. Props: hearses, pumpkin
  heaps, ghosts, little graveyards, dead trees with fairy lights. Orange lantern pools on cobbled lanes.
- Library data drives the renderer: `scene`/`nightScene` palettes, `streets` (ring roads, sidewalks, lamps, light pools, trees) and
  `props` (road, sidewalk, empty lot) placed deterministically and instanced. Labels and beacons use measured model heights.
- Sample plan instance types now vary (`t3.micro`, `t3.small`, `m5.large`, `c6i.xlarge`, `m5.2xlarge`) so the size tiers show.
- Checks: validator enforces vivid looks (40+ characters), tier and prop keys, and no identical GLB shared between worlds; a unit
  test checks distinct files, palettes and streets. The skill, template, README and `create-world` workflow now require vivid
  imagery, size tiers and props.
- Open: selective bloom is not added (no post-processing yet); emissive strength is tuned so windows stay saturated.

## Task 4 summary

- Registry now covers the requested ECS, EKS, API Gateway, CloudFront, DynamoDB, ElastiCache, EFS, EBS, SQS, SNS, Kinesis, EventBridge, Route 53, CloudWatch, KMS, Secrets Manager, WAFv2, VPC endpoint and Transit Gateway catalog, with exact service metadata and family fallbacks for unknown AWS types.
- The resource legend can highlight every resource of one type. Hover / selected nameplates show `Type (name)`; the Labels button shows every resource nameplate.

## Task 3 summary

- The sample opens automatically when a world starts. The graph becomes a world: a Global hub, one island per region with a district per AZ plus regional services, and a landmark per resource (silhouette families: tower, drum, silos, gate, roundabout, vault, pavilion, mailbox, mast, fence, pad, block).
- Hover, click, click-to-focus (camera glides), selection beacon, dependency lines, peers glow, others dim to 35%. The panel, legend and 3D scene share one selection store.
- Region accents are at least 60 degrees apart; AZ tints vary lightness by at most 6%.
- Landmarks are procedural placeholders. Blender libraries replace them in Tasks 5 and 6. Task 4 adds readable `Type (name)` hover labels, selected persistent labels, and a toggleable all-resource label layer.
- Final world acceptance requires distinct library models and layouts: Modern City stays bright/pastel, while Haunted World is dark indigo/blue stone with vivid orange lantern pools and teal spectral contrast.
- `.github/workflows/ci.yml` and `deploy.yml` are written but nothing is published until the owner enables Pages (Settings, Pages, Source: GitHub Actions).
- Local Playwright runs use 2 workers: software WebGL starves with more.

## Notes

- Reference images: `docs/images/City-Theme.jpeg`, `Haunted-Theme.jpeg`, `Aqua-Theme.png`, `Game.png`. Images are optional for new worlds (a written brief works).
- Playwright MCP needs Google Chrome installed (`chrome` channel). Until then, screenshots use
  `scripts/capture.mjs` with Playwright's bundled Chromium.
- `minimatch` is overridden to `^11.0.8` to clear GHSA-g3hv-75wg-m249 in typescript-eslint's dev dependency.
- The world screen currently shows a placeholder diorama; Task 3 replaces it with the graph-driven world.
