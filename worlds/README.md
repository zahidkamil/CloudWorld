# CloudWorld world libraries

Each world is a self-contained **instruction-set library**. The folder under `worlds/<world-id>/`
says how every AWS resource looks in that world and which reference image defines the style.
Kiro (with the Blender MCP) reads it to build the 3D models, and the validator checks it.

```
worlds/<world-id>/
  world.md        id, name, reference image file names, palette, lighting, camera, props, mood
  resources.md    one list entry per AWS resource family or service: look + model file + status
public/worlds/<world-id>/        (generated, committed)
  library.json    resource type -> model, scale, palette, lighting, props (read by the renderer)
  models/*.glb    optimized models exported from Blender
  preview.webp    world-card image captured from the real scene
```

Rules:

- The renderer contains no world-specific code. It reads `library.json`. A new world is a new folder.
- A reference image is optional. If a world has one, `world.md` lists it by file name under `docs/images/`, and
  `npm run validate:worlds` fails when a listed file is missing. A world with no image needs a `brief:` line instead.
- Resource lookup order: exact service key (`aws_instance`) -> family key (`family:compute`) ->
  `family:generic`. A missing model falls back to a simple procedural shape, so a world is playable
  before every model exists.
- Required keys for every world: `structure:region`, `structure:az`, `structure:vpc`,
  `structure:subnet`, and the 12 `family:*` keys. Service keys are optional extras.

## Adding a world

Run the Kiro Workflow `create-world` (`.kiro/workflows/create-world.workflow.json`, agent `world-builder`) or follow
`.kiro/skills/create-cloudworld-world/SKILL.md` by hand. Start by copying `worlds/_template/`.

## Existing worlds

| World           | Status                                      | Reference image                                 |
| --------------- | ------------------------------------------- | ----------------------------------------------- |
| `modern-city`   | planned                                     | `docs/images/City-Theme.jpeg`                   |
| `haunted-world` | planned                                     | `docs/images/Haunted-Theme.jpeg`                |
| `aqua-world`    | planned (built via the workflow in Task 11) | needs `docs/images/Aqua-Theme.*` from the owner |
