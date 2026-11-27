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

The recipe `.kiro/workflows/create-world.workflow.json` runs this skill in background steps with the `world-builder` agent
(`.kiro/agents/world-builder.md`). Enable Workflows first (Workspace Configuration, then Workflows), then ask Kiro to run
`create-world` or type `/workflow-run`.

Inputs are just two:

- `description`: one or many sentences describing the world, for example "A cozy mushroom village under giant glowing toadstools,
  with lantern-lit paths and a misty forest floor."
- `referenceImage`: a file name inside `docs/images/`, or `none`. An image is optional.

The first step deduces the world name and id from the description (a name in the description wins), writes the instruction set, and
pauses so the user can review `worlds/<id>/resources.md`. The next steps build models, integrate the world, then run the inspection
hooks (`.kiro/hooks/visual-review-playwright.json`, `.kiro/hooks/blender-model-review.json`, and the save-time checks), and finally
run the full test suite. You can also follow the same steps by hand with `/create-cloudworld-world`.

## Inputs to collect first

1. **World id and name.** When the user only gives a description, deduce them: 1 to 3 words in Title Case for the name, kebab-case
   for the id, not already used under `worlds/` or `public/worlds/`. A name in the description wins.
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
3. **Write the resource list with vivid imagery.** Fill `resources.md`. Every entry is one line:
   ``- `<key>` | model: `<file>.glb` | planned | <how it looks>``.
   - Required: 4 `structure:*` entries and 12 `family:*` entries.
   - Add about 10 key services (EC2, S3, RDS, DynamoDB, Lambda, load balancer, NAT, internet gateway,
     security group, IAM role, KMS) so the most recognizable resources stand out.
   - Add the four EC2 size tiers `aws_instance.tiny|small|large|huge`. The renderer picks one from
     `instance_type`, so a `t3.micro` and an `m5.2xlarge` look clearly different (for example a walk-up versus a
     supertall, or a cottage versus a castle).
   - Add 3 to 5 `prop:*` entries for street life (vehicles on the lanes, carts or pumpkins on the sidewalks,
     shops or graveyards on empty lots). Props are decoration and never stand for resources.
   - **Every look is vivid, concrete imagery (40+ characters; the validator enforces it).** Imagine the place
     first: what kind of town or realm is this, who lives there, what is lit at night? Then write each resource
     as a small scene: silhouette (tiers, roofs, towers, domes), materials and colours from the palette, three
     or four signature details, what glows, and a short metaphor for the AWS job ("a food truck that opens only
     when invoked", "a sealed crypt whose iron key never leaves"). Databases are big and round or industrial
     (domes, rotundas, tank farms, cauldrons). Plumbing (route tables, associations, EIPs) is small street
     furniture. `worlds/modern-city/resources.md` and `worlds/haunted-world/resources.md` are the examples to
     match.
   - Keep each look consistent with the reference and distinct from every other world: new silhouettes, never a
     recolour of another world's model.
   - Let the user adjust the list before building models. This list is where users say how each AWS
     resource should look in their world.
4. **Validate the text.** Run `npm run validate:worlds`. Fix every error.
5. **Check Blender.** The save hook `validate-glb-on-save` and the `blender-model-review` hook describe the checks. Call `blender/get_scene_info` (always allowed). Then `get_addon_status` and
   `execute_blender_code` need approval under the current permissions. Ask once for exactly what is needed.
   Never edit `permissions.yaml` or broaden permissions.
6. **Build models with the Blender MCP.** Write `worlds/<id>/blender/build_library.py` using the shared kit
   `worlds/_shared/blender/cw_kit.py` (copy the structure of `worlds/haunted-world/blender/build_library.py`):
   one factory function per model file, a `MODELS` map from resource key to `(file, scale)`, a `PROPS` list,
   then `kit.build_all(...)` and the `library.json` write. Run it with `execute_blender_code`
   (`exec(compile(open(p).read(), p, 'exec'))`, stdout redirected; print only the export table).
   Kit conventions, checked by `npm run validate:glb`:
   - Blender Z is up and fronts face -Y. The exporter writes glTF +Y up, so models stand upright in the app
     with no extra rotation.
   - 1 unit = 1 m, pivot at base centre, footprint about 5.8 x 5.8 (the app scales landmarks by about 0.42 to
     fit a 3.2 m lot). Budget about 1,500 triangles per landmark, 2,500 for a hero model.
   - At most three materials, shared by every model: `paint` (vertex colours carry every painted colour),
     `glow` (warm emissive) and `neon` (accent emissive). Meshes are joined per material, so a model costs at
     most three draw calls. Keep emissive strength near 1 so colours stay saturated after tone mapping.
   - Draco compression (the app self-hosts the decoder in `public/draco/`), no UVs, cameras, lights or
     textures. Aim for under 40 KB per model, 3 MB per world.
   - For each model, import the exported GLBs into a lineup and `look` from at least two angles. Compare with
     the reference and the `resources.md` imagery. Fix obvious problems.
   - Change each entry status from `planned` to `built`.
     Build `family:*` and `structure:*` entries first, then key services, tiers and props. A missing model is
     allowed while the world is `in-progress`; the renderer falls back to a procedural shape.
7. **Write `public/worlds/<id>/library.json`** (the build script does this). It holds:
   - `models`: each key to `{ file, scale, yOffset, height }`. `height` is measured at export; labels and the
     selection beacon sit above it.
   - `scene` (and optional `nightScene`): background, ground, earth, base, roof, accent, glow, sky and ground
     light, key light and intensities, decor, fog. The renderer reads these, so no palette lives in code.
   - `streets`: road, sidewalk, optional lane marking and crosswalk, lamp post and glow, `lightPools` for dark
     worlds, optional street-tree colours. Every district gets a ring road with these colours.
   - `props`: `[{ file, placement: road|sidewalk|lot, perDistrict, scale }]`, placed deterministically.
   - camera and lighting settings from `world.md`. Keep values in sync with the doc.
8. **Register the world** in `src/themes/worlds.ts` (`ALL_WORLDS`: name, tagline, blurb, accent colour, `available: true`). Its card shows
   `public/worlds/<id>/preview.webp`.
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
- Never share or copy a model file from another world.
- Never include API keys, personal paths, or secrets in a world library.

## Quick checklist

- [ ] `reference_images` lists real files in `docs/images/`, or `brief:` describes the look
- [ ] 4 `structure:*` and 12 `family:*` entries present
- [ ] Key services, the four EC2 size tiers and 3 to 5 props described with vivid imagery
- [ ] No model file shared with another world
- [ ] `npm run validate:worlds` passes
- [ ] GLBs exported, statuses `built`
- [ ] `library.json` written and registered
- [ ] Screenshot compared with the reference
- [ ] `npm run validate` and `npm run test:e2e` pass
