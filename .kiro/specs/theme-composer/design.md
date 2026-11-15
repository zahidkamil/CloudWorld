# Design — ThemeComposer

## Module layout

```
src/themes/descriptor.ts    ThemeDescriptor type + Zod schema + version
src/themes/builtins.ts      modern-city and haunted-world descriptors
src/themes/variation.ts     regionPalette(theme, region), azVariant(theme, region, az)
src/themes/composer/        vocabulary.ts, compose.ts (prompt -> ComposeResult)
src/themes/storage.ts       versioned localStorage persistence
src/themes/kits/city/       city landmarks, props, ground, atmosphere
src/themes/kits/haunted/    haunted landmarks, props, ground, atmosphere
public/assets/<kit>/        optimized GLBs + manifest.json
```

## ThemeDescriptor

```ts
interface ThemeDescriptor {
  version: 1;
  id: string;
  name: string;
  seed: number;
  kit: 'city' | 'haunted'; // architecture kit
  biome: 'urban' | 'snow' | 'desert' | 'forest' | 'swamp' | 'coastal';
  weather: 'clear' | 'fog' | 'snow' | 'rain';
  time: 'day' | 'dusk' | 'night';
  palette: { sky: string; ground: string; base: string; accent: string; glow: string; window: string };
  glow: number; // 0..1 emissive intensity
  density: number; // 0..1 decoration density
}
```

## Region and AZ variation

`regionPalette` rotates the accent hue by a hash of the region name in steps of at least 40 degrees, so
regions are clearly distinct. `azVariant` adjusts lightness/saturation by at most ±6% and picks small
prop and fog differences from a hash of the AZ suffix.

## Composer

Tokenize -> lowercase -> match vocabulary terms and synonyms (e.g., "futuristic" -> city kit + high glow,
"snowy" -> snow biome + snow weather, "glowing blue" -> palette accent blue + glow 0.9). Conflicts resolve
by last mention. Seed = FNV-1a hash of the normalized recognized terms. Result:
`{ ok: true, theme, recognized, ignored } | { ok: false, reason, suggestions }`.

## Rendering kits

A kit exports `{ Ground, District, Landmark(resource, variant), Props, Atmosphere }`. Procedural geometry
is generated once per kit and shared; repeated items use `InstancedMesh`. GLBs load lazily with
`useGLTF` and fall back to procedural geometry when missing.

## Testing

Unit: descriptor schema, determinism, vocabulary coverage, unsupported prompts, storage migration and
corruption, variation stability. E2E: theme switch preserves selection; create/save/reload flow.
Visual: Chromium screenshot checkpoints for each built-in world.
