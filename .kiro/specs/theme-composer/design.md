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
  "lighting": { "preset": "day", "presets": { "day": {}, "night": {} } },
  "camera": { "elevation": 35, "yaw": 45, "minDistance": 8, "maxDistance": 80 },
  "models": { "aws_instance": { "file": "models/ec2-instance.glb", "scale": 1, "yOffset": 0 } },
  "props": { "trees": "models/tree-round.glb" },
  "preview": "preview.webp"
}
```

Keys match `resources.md`. Models load lazily with `useGLTF`, are cached, and repeated props use `InstancedMesh`.
A missing file falls back to a procedural shape coloured from the palette, so a partially built world still runs.

## Resolution

`resolve(type)`: `models[type]` -> `models['family:' + registry.family]` -> `models['family:generic']` -> procedural.
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
