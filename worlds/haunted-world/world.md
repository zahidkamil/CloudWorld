---
id: haunted-world
name: Haunted World
status: planned
reference_images:
  - docs/images/Haunted-Theme.jpeg
ui_reference: docs/images/Game.png
---

# Haunted World

A hand-painted, stylized gothic courtyard at night. Cobblestone, blue slate roofs, warm orange windows,
pumpkins, candles, tombstones, and drifting teal ghost light. Moody but friendly, not gory.

## Concept

Infrastructure as a haunted village. Regions are raised courtyard platforms, AZs are walled terraces,
resources are houses, crypts, lanterns and monuments.

## Reference image notes

- `Haunted-Theme.jpeg` (primary, copy this look):
  - Stone buildings with blue slate-tile roofs, crenellated walls, small conical turrets, pointed arch
    windows glowing warm orange, dark window frames and corner stones.
  - Cobblestone ground in fan and ring patterns with frosty white patches in the gaps.
  - Jack-o'-lanterns and plain pumpkins, tombstones with rounded tops, clusters of melting candles.
  - Spiked iron fence posts joined by drooping chains, a gallows-style post with a hanging lantern.
  - Blue heraldic banner on a stone pillar, a winged angel statue holding a glowing blue orb,
    a bare twisted tree with fairy lights, round stone steps.
  - Teal ghost wisps rising from graves. Cool blue and violet shadows with warm orange accents.
- `Game.png`: UI target only (card layout, dark panel). Not a 3D reference.

## Palette

| Role                 | Hex                  | Notes                                                           |
| -------------------- | -------------------- | --------------------------------------------------------------- |
| sky / background     | `#141a33`            | deep indigo night, faint violet haze near the horizon `#2a2550` |
| ground (cobblestone) | `#4a4553`            | with lighter `#8e8aa0` frost patches                            |
| base (walls)         | `#5b5f78`, `#4b4e66` | blue-grey stone                                                 |
| roof                 | `#3c4f9c`            | blue slate tiles, `#2f3d7d` for shaded rows                     |
| accent               | `#ff9a3c`            | window and pumpkin orange; region accents rotate hue from this  |
| glow                 | `#ffb454`            | windows, candles, lanterns. Ghost glow `#52e0d0`                |

## Lighting and atmosphere

- Night. Cool moonlight key from upper right (`#8fa6ff`, low intensity), warm point lights at windows,
  lanterns and candles, hemisphere fill in indigo.
- Low ground fog, thicker at AZ borders. Teal ghost wisps and a few drifting embers.
- Selective bloom on emissive windows, lanterns, candles and ghost light only.

## Camera

Angled three-quarter view from above, about 40 degrees elevation, framing a courtyard with buildings
on the far side like the reference. Orbit and zoom limits keep the platform edge visible.

## Ground and props

- Cobblestone tiles with fan and ring patterns, stone steps, low walls, chain fences.
- Repeatable props: pumpkins, tombstones, candles, bare trees, lamp posts, bats, ghosts, crates, barrels.
- Ambient animation: window flicker, candle flame, ghost wisp drift, fog drift, occasional bat.
- Props are decoration. They never represent AWS resources.

## Model style guide

- Budget: 2,000 triangles per landmark (4,000 for key services), one 512 px painted atlas per world,
  max 3 materials per model. Hand-painted look: baked colour variation, no photoreal textures.
- 1 unit = 1 metre. Footprint of a landmark about 8 x 8 units. Pivot at base centre, +Y up.
- Emissive materials only for windows, candles, lanterns and ghost light.
- Export GLB, mesh-opt or Draco compressed. Names must match `resources.md` file names.
