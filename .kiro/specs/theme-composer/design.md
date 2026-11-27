# Design — ThemeComposer and World Libraries

## Layout

```
worlds/<id>/world.md, resources.md, blender/*.py     instruction set (source of truth for looks)
worlds/_template/                                      copy to start a new world
public/worlds/<id>/library.json, models/*.glb, preview.webp
src/themes/descriptor.ts      ThemeDescriptor + Zod schema + version
src/themes/builtins.ts        world list: id, name, tagline, library path
src/themes/library.ts         load + validate library.json, resolve(resourceType) -> ModelRef | fallback
src/themes/variation.ts       regionPalette(theme, region), azVariant(theme, region, az)
src/themes/storage.ts         versioned localStorage for saved themes
src/themes/llm/               (last task) provider clients, prompt, schema, key handling
scripts/validate-worlds.mjs   instruction-set validator (npm run validate:worlds)
```

## library.json

```json
{
  "version": 1,
  "id": "modern-city",
  "name": "Modern City",
  "palette": {
    "sky": "#bfe6fb",
    "ground": "#7bc043",
    "base": "#d8c3a5",
    "accent": "#f3a6c8",
    "glow": "#ffd479"
  },
  "scene": {
    "background": "#bfe6fb",
    "ground": "#7bc043",
    "keyIntensity": 2.4,
    "decor": "blossom",
    "fog": 1
  },
  "nightScene": { "background": "#07142d", "glow": "#7df9ff", "keyIntensity": 1.0 },
  "streets": {
    "road": "#3a3d4a",
    "sidewalk": "#dcd5c6",
    "marking": "#f2c94c",
    "lampPost": "#4a5563",
    "lampGlow": "#ffd479"
  },
  "lighting": { "preset": "day" },
  "camera": { "elevation": 36, "yaw": 45, "minDistance": 7, "maxDistance": 140 },
  "models": {
    "aws_instance": { "file": "models/ec2-midrise.glb", "scale": 0.42, "yOffset": 0, "height": 4.96 },
    "aws_instance.huge": { "file": "models/ec2-supertall.glb", "scale": 0.42, "yOffset": 0, "height": 11.68 }
  },
  "props": [{ "file": "models/prop-yellow-cab.glb", "placement": "road", "perDistrict": 3, "scale": 0.34 }],
  "preview": "preview.webp"
}
```

(`scene` and `nightScene` list every `ScenePalette` field in the real files; shortened here.)

Keys match `resources.md`. Models load lazily with `useGLTF`, are cached, and repeated props use `InstancedMesh`.
A missing file falls back to a procedural shape coloured from the palette, so a partially built world still runs.

## Resolution

`resolveLibraryModel(library, type, family, attributes)`: `models[type + '.' + sizeTier(instance_type)]` -> `models[type]` ->
`models['family:' + family]` -> `models['family:generic']` -> procedural. Size tiers: nano/micro tiny, small/medium small,
large/xlarge large, 2xlarge+ or metal huge.

Streets and props are drawn by `themes/kits/streets` from `library.streets` and `library.props`: a pure `planStreets`
(ring road, sidewalk, lane dashes, crosswalks, lamps, trees) and `placeProps` (road, sidewalk, empty-lot slots), all
instanced, so the whole world's street dressing costs a few dozen draw calls.
Structure keys (`structure:region|az|vpc|subnet`) are used by the layout for slabs, districts, boundaries, and lots.

## Region and AZ variation

`regionPalette` rotates the accent hue by a hash of the region name in steps of at least 40 degrees. `azVariant` changes
lightness and saturation by at most 6% and picks small prop and fog differences from a hash of the AZ suffix. Pure functions.

## Create World with an LLM (deferred; research notes only)

- UI hidden until a key is provided. Provider picker: OpenAI or Anthropic. Key kept in memory; optional "remember for this tab" uses sessionStorage.
- Request: the user's text plus a compact catalogue (library ids, biomes, weather, times, palette names, glow range). Response must match a JSON schema for `ThemeDescriptor`
  (library id from the catalogue, overrides from the vocabulary). Validate with Zod; discard anything unknown.
- Anthropic: Messages API called directly from the browser needs the `anthropic-dangerous-direct-browser-access: true` header. Structured JSON output uses the schema option in the request
  (see the Claude structured outputs docs).
- OpenAI: Responses API with a strict `json_schema` text format (see the OpenAI structured outputs docs). Browser CORS support must be confirmed against the live API; if blocked, show a clear message.
- Always handle refusals, incomplete output, 401/429/5xx, network errors. Never log the key or full prompts with the key.
- Tests: mocked fetch for both providers, schema rejection, error mapping, and a key-never-persisted check. A manual live check with real keys before release.

## Testing

Unit: library schema, resolve fallbacks, variation stability, storage migration and corruption, world validator. E2E: switch worlds keeps selection and findings;
every world renders with at least one model or fallback. Visual: Chromium-only screenshots (`@visual`) per world.
