# Visual Quality

Visual quality is a release requirement. Worlds must feel like polished, cohesive 3D game dioramas,
not collections of basic cubes and cylinders.

## References

- **Modern City:** dense isometric night city. Dark streets with lamp pools, crosswalks, varied tower
  silhouettes (stepped, cylindrical, setback, rooftop units), cyan/teal and warm window glow, red and
  purple mid-rises, traffic, small parks and trees. Gentle depth-of-field or fog at the edges.
- **Haunted World:** warm orange storybook diorama on a raised base slab. Gothic mansions with steep
  slate roofs, dormers, chimneys, church/bell tower, iron fences, graveyard, jack-o'-lanterns, crooked
  trees, lamp posts, ghosts and bats, low fog, orange window light.
- Landing UI: dark rounded panel, display-font title, preview cards, Create World prompt with a purple
  primary button.

## Rules

- Every landmark has at least two levels of detail in silhouette (base + body + roof/top detail).
- Use the theme palette; region accents must be clearly different, AZ variants subtle.
- Lighting: one key directional light with soft shadows, hemisphere/ambient fill, emissive windows,
  selective bloom only on emissive materials. Avoid washed-out or fully black scenes.
- Ground is never a flat empty plane: roads, sidewalks, lots, edges, props.
- Highlights: selected = bright outline + beacon; dependency = strong glow; peers = softer glow;
  others dim to ~35% but stay readable.
- Text in the 3D scene is minimal; prefer DOM labels.
- Motion is restrained (traffic, flicker, fog drift) and respects reduced-motion.

## Verification

After each visual milestone, capture 1440x900 screenshots of each world (Playwright MCP or
`scripts/capture.mjs`), compare against the references, and fix obvious problems before moving on.
