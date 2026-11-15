---
id: aqua-world
name: Aqua World
status: planned
brief: A bright underwater fantasy city of glass domes and boardwalks on rocky islands, with corals, waterfalls, and sea life.
reference_images:
  - docs/images/Aqua-Theme.png
ui_reference: docs/images/Game.png
---

# Aqua World

A luminous underwater city. Glass domes and curved lab buildings sit on rocky islands joined by wooden
boardwalks and lantern posts. Coral, palms, waterfalls, jellyfish, a whale and a manta ray add life.
Cheerful and bright, not murky or scary.

## Concept

Infrastructure as an ocean research city. Regions are reef islands, AZs are dome clusters linked by
boardwalk bridges, resources are domes, labs and towers.

## Reference image notes

- `Aqua-Theme.png` (primary, copy this look):
  - Saturated turquoise water with a bright blue gradient to deep blue at the top of the frame.
  - Pale white and silver buildings with curved roofs and glass panels, glowing cyan edge lighting and
    warm amber interior light.
  - Large geodesic and smooth glass domes (one tinted purple), a central grand dome with tall curved
    spires and a glowing cloud orb fountain in front of it.
  - A white stone castle with flags on a rocky island with waterfalls.
  - Wooden boardwalk bridges on stone piers with glowing cyan lantern posts.
  - Rocky island edges with palm trees, ferns, and bright pink, purple and orange corals.
  - Floating jellyfish, a blue whale, a manta ray, small fish, soft light rays.
  - Floating label plates on buildings (service name with an icon) are a UI idea. Do not model company
    logos. Use DOM labels instead.
- `Game.png`: UI target only. Not a 3D reference.

## Palette

| Role                     | Hex                  | Notes                                                 |
| ------------------------ | -------------------- | ----------------------------------------------------- |
| sky / background (water) | `#1aa6e0`            | gradient to `#0a5fb0` toward the top, soft light rays |
| ground (rock and sand)   | `#5c6f86`            | rock `#4a5a70`, sand `#d9c9a6`, moss `#3f8f5a`        |
| base (buildings)         | `#e3edf5`, `#c9dae8` | pale white and silver                                 |
| glass                    | `#8fe3ff`            | at 35% opacity with a cyan rim                        |
| accent                   | `#ff6fa8`            | coral pink; region accents rotate hue from this       |
| glow                     | `#52f2ff`            | edge lights, lanterns; warm interior `#ffb84d`        |
| violet dome              | `#8a63d2`            | VPC style tint, jellyfish `#d9a8ff`                   |

## Lighting and atmosphere

- Bright underwater daylight: soft key from above, blue-teal hemisphere fill, light rays, mild depth haze.
- Caustic shimmer on the ground and water surface (cheap animated texture), bubbles drifting up.
- Bloom on cyan edge lights, lanterns, jellyfish and the cloud orb only.

## Camera

Three-quarter view from above, about 35 degrees elevation, framing the central dome with islands on both
sides. Orbit and zoom limited so the water surface and island edges stay in frame.

## Ground and props

- Rocky island bases with mossy tops, sand patches, waterfalls pouring from islands.
- Repeatable props: corals (branching, tube, fan), palms, ferns, boardwalk segments, lantern posts, fish schools.
- Ambient animation: jellyfish bob, fish schools loop, whale and manta ray drift far off, water caustics.
- Props are decoration. They never represent AWS resources.

## Model style guide

- Budget: 2,000 triangles per landmark (4,000 for key services), one 512 px atlas per world, max 3 materials
  per model. Glass uses one shared transparent material.
- 1 unit = 1 metre. Footprint of a landmark about 8 x 8 units. Pivot at base centre, +Y up.
- Emissive materials only for edge lights, lanterns, interior windows, jellyfish and the cloud orb.
- Export GLB, mesh-opt or Draco compressed. Names must match `resources.md` file names.
