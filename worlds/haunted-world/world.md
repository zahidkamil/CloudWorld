---
id: haunted-world
name: Haunted World
status: built
reference_images:
  - docs/images/Haunted-Theme.jpeg
ui_reference: docs/images/Game.png
---

# Haunted World

A dark, vivid vampire estate at night. Lonely gothic houses stand apart from each other: crooked
cottages, Victorian houses with witch-hat turrets, gated manors and Dracula's castle on its rock. Blue
slate roofs and blue-grey stone glow with orange windows and lanterns; teal ghost light rises from
graveyards and cauldrons. Moody, high contrast and friendly, never gory.

## Concept

Infrastructure as a vampire estate. Regions are floating estates, AZs are walled grounds ringed by
cobbled lanes with orange lantern pools, resources are houses, crypts and monuments. House size tells you
the machine size: an EC2 `t3.micro` is a crooked cottage, an `m5.large` a gated manor, a `2xlarge` is
Dracula's castle. Databases are round crypt towers and bubbling cauldron breweries.

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

- Every district gets a ring of cobbled lane (`#3a3748`) and frosty stone sidewalk (`#77788f`), iron lamp
  posts with orange lanterns and soft orange light pools on the ground. No lane paint, no street trees.
  Colours live in `library.json` `streets`.
- Props from `library.json` `props`: a hearse on the lanes, pumpkin heaps and small ghosts on the
  sidewalks, and a little graveyard or a dead tree with fairy lights on every empty lot.
- Props are decoration. They never represent AWS resources and are not selectable.

## Model style guide

- Built with the shared kit `worlds/_shared/blender/cw_kit.py`: Blender Z up, exported `+Y up`, models
  stand upright with no extra rotation. Fronts face -Y in Blender (toward the camera in the app).
- Three materials at most: `paint` (vertex colours), `glow` (orange `#ff9a3c`: windows, lanterns,
  candles, jack-o'-lanterns) and `neon` (teal `#52e0d0`: ghost light, runes, cauldrons).
- Budget: about 1,500 triangles per landmark, 2,500 for the castle. Draco compressed, under 25 KB each.
- 1 unit = 1 metre in Blender, footprint about 5.8 x 5.8, pivot at base centre, scaled 0.42 in the app.
- Original geometry only; no file is shared with Modern City.
