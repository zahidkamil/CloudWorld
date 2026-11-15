---
name: create-cloudworld-world
description: Create, extend, or validate a CloudWorld world (theme library). Use when asked to add a new world such as Aqua, to write or edit how AWS resources look in a world, to build a world's Blender models from a reference image, or to validate worlds/<id>/ libraries.
---

# Create a CloudWorld world

A world is an instruction-set library in `worlds/<world-id>/` plus generated assets in
`public/worlds/<world-id>/`. The renderer is world-agnostic: it reads `library.json`. Adding a world
never needs renderer code changes.

Read `worlds/README.md` for the folder layout and the entry format. Existing examples:
`worlds/modern-city/` (`docs/images/City-Theme.jpeg`), `worlds/haunted-world/`
(`docs/images/Haunted-Theme.jpeg`) and `worlds/aqua-world/` (`docs/images/Aqua-Theme.png`).

## Running it as a Kiro Workflow

The recipe `.kiro/workflows/create-world.workflow.json` runs this skill in background steps using the
`world-builder` agent (`.kiro/agents/world-builder.md`). Enable Workflows first (Workspace Configuration,
then Workflows), then ask Kiro to run `create-world` or type `/workflow-run`. Inputs: `worldId`,
`worldName`, `referenceImage` (a file name in `docs/images/`, or `none`), and `brief`. The run pauses after
the resource list so the user can adjust it. You can also follow the same steps by hand with `/create-cloudworld-world`.

## Inputs to collect first

1. **World id and name**, kebab-case id (for example `aqua-world`).
2. **Style source.** Either:
   - **A reference image** in `docs/images/` (optional). Write its exact file name, for example
     `docs/images/Aqua-Theme.png`, under `reference_images` in `world.md`. The validator fails if a listed file
     does not exist.
   - **A written brief** when there is no image. Put a `brief:` line (40+ characters) in the front matter and
     describe shapes, materials, colours and mood in `world.md`. Ask the user for details if they gave only a name.
     A world needs one of the two. An image is never required.
3. Optional written notes from the user (mood, colours, things to avoid).

## Workflow

1. **Scaffold.** Copy `worlds/_template/` to `worlds/<id>/`. Set `id`, `name`, `status: planned`, and
   `reference_images`.
2. **Study the style source.** Read each reference image with `read_file` (if there is one). Fill in `world.md`: concept, notes per image
   (what to copy, what to ignore), palette with hex values, lighting, camera, ground and props, model
   style guide. Be concrete. Another person should be able to model from it.
3. **Write the resource list.** Fill `resources.md`. Every entry is one line:
   ``- `<key>` | model: `<file>.glb` | planned | <how it looks>``.
   - Required: 4 `structure:*` entries and 12 `family:*` entries.
   - Add about 10 key services (EC2, S3, RDS, Lambda, load balancer, NAT, internet gateway,
     security group, IAM role, KMS) so the most recognizable resources stand out.
   - Describe silhouette, materials, colours, details. Keep each look consistent with the reference.
   - Let the user adjust the list before building models. This list is where users say how each AWS
     resource should look in their world.
4. **Validate the text.** Run `npm run validate:worlds`. Fix every error.
5. **Check Blender.** Call `blender/get_scene_info` (always allowed). Then `get_addon_status` and
   `execute_blender_code` need approval under the current permissions. Ask once for exactly what is needed.
   Never edit `permissions.yaml` or broaden permissions.
6. **Build models with the Blender MCP.** Save reusable scripts in `worlds/<id>/blender/`. For each entry
   in `resources.md`:
   - Build or refine the model with `execute_blender_code`. Respect the world's triangle budget, scale
     (1 unit = 1 m), pivot at base centre, +Y up, max 3 materials. Share materials between models.
   - Look at it with `look` from at least two angles. Compare with the reference. Fix obvious problems.
   - Export `public/worlds/<id>/models/<file>.glb` (apply modifiers, no cameras or lights, Draco or
     meshopt compression, no unused data). Target under 150 KB per model, under 3 MB per world.
   - Change the entry status from `planned` to `built`.
     Build `family:*` and `structure:*` entries first, then key services. A missing model is allowed while
     the world is `in-progress`; the renderer falls back to a procedural shape.
7. **Write `public/worlds/<id>/library.json`.** Maps each key to `{ file, scale, yOffset }` and holds the
   palette, lighting, fog, camera, and prop settings from `world.md`. Keep values in sync with the doc.
8. **Register the world** in the world list (`src/themes/builtins.ts`), with its card name and tagline.
9. **Verify in the app.** Run `npm run build`, serve it, and use Playwright (MCP or `scripts/capture.mjs`)
   to capture the sample plan in the new world. Compare with the reference image. Fix and repeat until the
   world looks cohesive. Capture `public/worlds/<id>/preview.webp` from the real scene.
10. **Run checks.** `npm run validate`, `npm run test:e2e`. Switching to the new world must not change graph,
    selection, or findings. Update `status` to `built` only when every entry is built.
11. **Report** to the user with screenshots and the model list. Commit only after the user approves.

## Rules

- Original models only. Use the reference for style, never copy or trace artwork directly.
- Blender is development-only. Judges never need it.
- Do not change another world's files while creating a new one.
- Keep descriptions in `resources.md` current if a model changes.
- Never include API keys, personal paths, or secrets in a world library.

## Quick checklist

- [ ] `reference_images` lists real files in `docs/images/`, or `brief:` describes the look
- [ ] 4 `structure:*` and 12 `family:*` entries present
- [ ] Key services described
- [ ] `npm run validate:worlds` passes
- [ ] GLBs exported, statuses `built`
- [ ] `library.json` written and registered
- [ ] Screenshot compared with the reference
- [ ] `npm run validate` and `npm run test:e2e` pass
