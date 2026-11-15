# Visual Quality

Visual quality is a release requirement. Worlds must feel like polished, cohesive 3D game dioramas,
not collections of basic cubes and cylinders.

## Source of truth

Each world's look is defined in `worlds/<id>/world.md` and `worlds/<id>/resources.md`, and by the
reference images named there (all under `docs/images/`):

- **Modern City:** `docs/images/City-Theme.jpeg`. Bright isometric city slab: floating grass-and-earth
  base, pastel stone towers with window grids and rooftop gardens, blossom and round trees, river with a
  stone arch bridge, roads, crosswalks, small vehicles, soft shadows. A night preset reuses the models
  (navy sky, lit windows, lamp pools, subtle bloom).
- **Haunted World:** `docs/images/Haunted-Theme.jpeg`. Hand-painted gothic courtyard: blue slate roofs,
  crenellated stone, glowing arched windows, cobblestone with frost, pumpkins, candles, tombstones,
  chain fence, blue banner, angel statue, teal ghost wisps, low fog.
- **Landing UI:** `docs/images/Game.png`. Dark rounded panel, display title with tagline, large world
  preview cards with name and subtitle. (Its "Create your own world" panel appears only with an API key.)

Look at the reference image before building or judging any visual work.

## Rules

- Every landmark has at least two levels of detail in silhouette (base, body, roof or top detail).
- Use the world palette. Region accents must be clearly different; AZ variants subtle.
- Lighting: one key light with soft shadows, hemisphere or ambient fill, emissive windows, selective bloom
  only on emissive materials. Avoid washed-out or fully black scenes.
- Ground is never a flat empty plane: roads, paving, lots, edges, props.
- Highlights: selected = bright outline + beacon; dependency = strong glow; peers = softer glow;
  others dim to about 35% but stay readable.
- Text in the 3D scene is minimal; prefer DOM labels.
- Motion is restrained (traffic, flicker, fog drift) and respects reduced motion.
- Models are original. Use references for style only, never copy artwork.

## Verification

After each visual milestone, capture 1440x900 screenshots of each world (Playwright MCP or
`scripts/capture.mjs`), compare against that world's reference image, and fix obvious problems before moving on.
