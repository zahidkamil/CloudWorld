# CloudWorld world libraries

Each world is a self-contained **instruction-set library**. The folder under `worlds/<world-id>/`
says how every AWS resource looks in that world and which reference image defines the style.
Kiro (with the Blender MCP) reads it to build the 3D models, and the validator checks it.

```
worlds/<world-id>/
  world.md        id, name, reference image file names, palette, lighting, camera, props, mood
  resources.md    one list entry per AWS resource family or service: vivid look + model file + status
  blender/        build_library.py: builds every model with the shared kit and writes library.json
worlds/_shared/blender/cw_kit.py   shared Blender kit: primitives, gothic and city helpers, export rules
public/worlds/<world-id>/        (generated, committed)
  library.json    resource key -> model, scale, measured height; scene and nightScene palettes,
                  streets (road, sidewalk, lamp colours) and props (read by the renderer)
  models/*.glb    optimized models exported from Blender
  preview.webp    world-card image captured from the real scene
```

Rules:

- The renderer contains no world-specific code. It reads `library.json`. A new world is a new folder.
- A reference image is optional. If a world has one, `world.md` lists it by file name under `docs/images/`, and
  `npm run validate:worlds` fails when a listed file is missing. A world with no image needs a `brief:` line instead.
- Resource lookup order: size tier (`aws_instance.large`, from `instance_type`) -> exact service key
  (`aws_instance`) -> family key (`family:compute`) -> `family:generic`. A missing model falls back to a simple procedural shape, so a world is playable
  before every model exists.
- Required keys for every world: `structure:region`, `structure:az`, `structure:vpc`,
  `structure:subnet`, and the 12 `family:*` keys. Service keys, EC2 size tiers and props are optional
  but expected for a polished world.
- Every look in `resources.md` is vivid imagery (40+ characters): silhouette, materials, colours, signature
  details, what glows, and what it means for the AWS resource. See `worlds/_template/resources.md`.
- Worlds never share models. `npm run validate:glb` fails if two worlds ship identical GLB bytes.
- Models use the shared kit conventions: Blender Z up exported as glTF +Y up (no rotation in the app), at
  most three materials (`paint` vertex colours, `glow`, `neon`), Draco compression (decoder self-hosted in
  `public/draco/`).

## Adding a world

Run the Kiro Workflow `create-world` (`.kiro/workflows/create-world.workflow.json`, agent `world-builder`). Give it a description of
the world in one or many sentences; the name and id are deduced from it. Or follow
`.kiro/skills/create-cloudworld-world/SKILL.md` by hand. Start by copying `worlds/_template/`.

## Existing worlds

| World           | Status  | Look                                                               | Reference image                  |
| --------------- | ------- | ------------------------------------------------------------------ | -------------------------------- |
| `modern-city`   | built   | Manhattan-style downtown: walk-ups to supertalls, cabs, food carts | `docs/images/City-Theme.jpeg`    |
| `haunted-world` | built   | Vampire estate: cottages to Dracula's castle, crypts, cauldrons    | `docs/images/Haunted-Theme.jpeg` |
| `aqua-world`    | planned | Undersea research domes (built via the workflow in Task 11)        | `docs/images/Aqua-Theme.png`     |
