---
id: your-world-id
name: Your World Name
status: planned
brief: One or two sentences describing the look. Required when there is no reference image.
reference_images:
  - docs/images/Your-Theme.jpeg
ui_reference: docs/images/Game.png
---

# Your World Name

Replace every placeholder. Keep the front matter format: `key: value` lines and `- item` lists only.

A reference image is optional. With one, list its file name under `reference_images` (files live in
`docs/images/`). Without one, delete the list item, leave `reference_images:` empty, and write a `brief:` of
40+ characters. The rest of this document still applies.

## Concept

One or two sentences. What is this place and how should it feel?

## Reference image notes

For each file in `reference_images`, say exactly what to copy from it (shapes, materials, colours,
mood) and what to ignore. With no image, describe the look in words here: shapes, materials, colours, mood,
and comparable places or games.

- `Your-Theme.jpeg`: ...

## Palette

| Role                  | Hex       | Notes                               |
| --------------------- | --------- | ----------------------------------- |
| sky / background      | `#000000` |                                     |
| ground                | `#000000` |                                     |
| base (building walls) | `#000000` |                                     |
| accent                | `#000000` | region accents rotate hue from this |
| glow                  | `#000000` | emissive windows, lamps             |

## Lighting and atmosphere

Key light direction and colour, fill, fog, time of day, bloom, particles.

## Camera

Default angle, zoom limits, any framing notes.

## Ground and props

Ground treatment (grass, cobblestone, water...), repeatable props (trees, lamps, vehicles...), ambient
animation. Props are decoration only and never represent AWS resources.

## Model style guide

Polygon budget per model, texture size, material count, scale (1 unit = 1 metre), pivot at base centre,
+Y up, export as GLB with Draco/meshopt where it helps.
