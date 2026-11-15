---
id: modern-city
name: Modern City
status: planned
reference_images:
  - docs/images/City-Theme.jpeg
ui_reference: docs/images/Game.png
---

# Modern City

A bright, clean, isometric city diorama. Pastel stone towers, cherry-blossom trees, a river with a
stone arch bridge, and a floating grass-and-earth slab. Calm and friendly, easy to read from above.

## Concept

Infrastructure as a living city. Regions are floating city slabs, AZs are blocks separated by streets
and the river, resources are buildings and street furniture.

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

- Roads and crosswalks as a tiled network between lots; sidewalks with paving pattern.
- Repeatable props: round trees, blossom trees, hedges, street lamps, benches, cars, truck, boats.
- Ambient animation: slow car traffic on loops, gentle water shimmer, blossom petals (very sparse).
- Props are decoration. They never represent AWS resources.

## Model style guide

- Budget: 1,500 triangles per landmark (3,000 for key services), one 512 px texture atlas per world
  plus flat colours, max 3 materials per model.
- 1 unit = 1 metre. Footprint of a landmark about 8 x 8 units. Pivot at base centre, +Y up.
- Export GLB, mesh-opt or Draco compressed. Names must match `resources.md` file names.
