---
id: modern-city
name: Modern City
status: built
reference_images:
  - docs/images/City-Theme.jpeg
ui_reference: docs/images/Game.png
---

# Modern City

A bright, vivid US downtown in the spirit of Manhattan, on floating grass-and-earth slabs. Red-brick
walk-ups with fire escapes and water towers, limestone mid-rises, art-deco skyscrapers and glass
supertalls share avenues with yellow cabs, food carts, cafés and shop rows. Calm and friendly by day,
neon and lit windows at night. Easy to read from above.

## Concept

Infrastructure as a living downtown. Regions are floating city slabs, AZs are blocks ringed by avenues and
sidewalks, resources are buildings and street furniture. Building size tells you the machine size: an EC2
`t3.micro` is a walk-up, an `m5.large` is an art-deco skyscraper, a `2xlarge` is a supertall. Databases
are big round landmarks (a copper-domed rotunda for RDS, a tank refinery for DynamoDB). Serverless is a
food truck that only opens when invoked.

## Reference image notes

- `City-Theme.jpeg` (primary, copy this look):
  - Floating slab with a grass top and layered earth/brick cutaway edge, soft long shadow on a pale
    sky-blue background.
  - Towers in beige, sand, grey-blue and soft white stone with regular window grids, stepped setbacks,
    balconies, rooftop gardens and small rooftop units.
  - Round green trees and pink cherry-blossom trees along streets and the slab edge.
  - Asphalt roads with yellow centre lines, crosswalks, small cars, a delivery truck, street lamps.
  - A river channel crossed by a stone arch bridge, with tiny boats.
  - Clean low-poly look with soft ambient occlusion and gentle shading. No harsh outlines.
- `Game.png`: UI target only (card layout, dark panel). Not a 3D reference.

## Palette

| Role             | Hex                             | Notes                                              |
| ---------------- | ------------------------------- | -------------------------------------------------- |
| sky / background | `#bfe6fb`                       | pale sky blue, soft vertical gradient to `#d9f1ff` |
| ground (grass)   | `#7bc043`                       | slab top                                           |
| earth edge       | `#c8794a`                       | slab side layers, alternate with `#b9683f`         |
| road             | `#3d4150`                       | with `#f2c94c` centre line                         |
| base (towers)    | `#d8c3a5`, `#cfd3dc`, `#e9e4da` | mix per tower                                      |
| accent           | `#f3a6c8`                       | blossom pink; region accents rotate hue from this  |
| glow             | `#ffd479`                       | window and lamp light, used at dusk and night      |

## Lighting and atmosphere

- Default time: late morning. Warm key light from upper left, cool sky fill, soft shadows (long, light).
- Light distance haze at the slab edges. No heavy fog.
- Night variant (lighting preset, same models): deep navy sky, lit windows in warm yellow and cyan,
  lamp pools on roads, subtle bloom on emissive materials only. Inspired by the neon night city
  reference shared in chat. It is a preset of this world, not a separate world.

## Camera

Isometric-style perspective, about 35 degrees elevation, 45 degrees yaw, framing the whole region slab.
Orbit limited to keep the slab visible. Zoom between whole-slab and street-level close-up.

## Ground and props

- Every district gets a ring avenue (asphalt, yellow lane dashes, white crosswalks), a pale sidewalk,
  globe street lamps and round street trees. Colours live in `library.json` `streets`.
- Props from `library.json` `props`: yellow cabs on the avenues, hot-dog carts on the sidewalks, and a café
  or shop row on every empty lot. Placement is deterministic from the layout.
- Props are decoration. They never represent AWS resources and are not selectable.

## Model style guide

- Built with the shared kit `worlds/_shared/blender/cw_kit.py`: Blender Z up, exported with `+Y up`, so
  models stand upright in three.js with no extra rotation.
- Three materials at most: `paint` (vertex colours), `glow` (warm windows `#ffd479`), `neon` (cyan
  `#5ff0e6`). Meshes joined per material: three draw calls per model.
- Budget: about 1,500 triangles per landmark, 3,000 for hero services. Draco compressed, under 40 KB each.
- 1 unit = 1 metre in Blender, footprint about 5.8 x 5.8, pivot at base centre. `library.json` scales
  landmarks by 0.42 so they fit a 3.2 m lot. Heights are measured at export and stored per model.
