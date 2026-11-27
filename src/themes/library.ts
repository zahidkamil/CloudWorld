import { z } from 'zod';
import type { ResourceFamily } from '@/engine/registry/registry';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i);
const modelFile = z.string().regex(/^models\/[a-z0-9]+(?:-[a-z0-9]+)*\.glb$/);

const modelSchema = z.object({
  file: modelFile,
  scale: z.number().positive().max(4),
  yOffset: z.number().min(-10).max(10),
  /** Measured model height in world units after scaling. Labels and the selection beacon sit above it. */
  height: z.number().positive().max(40).optional(),
});

/** Colours and lights for the shared renderer. Mirrors `ScenePalette` in engine/render/palette.ts. */
const sceneSchema = z.object({
  background: hex,
  ground: hex,
  earth: hex,
  base: hex,
  roof: hex,
  accent: hex,
  glow: hex,
  skyLight: hex,
  groundLight: hex,
  keyLight: hex,
  keyIntensity: z.number().min(0).max(8),
  fillIntensity: z.number().min(0).max(8),
  decor: z.enum(['blossom', 'pine']),
  /** Fog density multiplier: 1 is the default distance fog, higher is thicker. */
  fog: z.number().min(0.2).max(4).optional(),
});

/** Street dressing drawn around every district: a ring road, sidewalks, lamps and optional trees. */
const streetsSchema = z.object({
  road: hex,
  sidewalk: hex,
  /** Lane paint. Omit for unmarked lanes such as cobblestone. */
  marking: hex.optional(),
  crosswalk: hex.optional(),
  lampPost: hex,
  lampGlow: hex,
  /** Soft glowing discs under each lamp, for dark worlds. */
  lightPools: z.boolean().optional(),
  /** Street tree crowns. Omit for no trees. */
  tree: hex.optional(),
  trunk: hex.optional(),
});

/** A decorative model repeated across districts. Props never represent resources and are not selectable. */
const propSchema = z.object({
  file: modelFile,
  placement: z.enum(['road', 'sidewalk', 'lot']),
  perDistrict: z.number().int().min(0).max(8),
  scale: z.number().positive().max(4),
});

export const worldLibrarySchema = z.object({
  version: z.literal(1),
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  referenceImages: z.array(z.string()).optional(),
  palette: z.object({
    sky: hex,
    ground: hex,
    earth: hex,
    base: hex,
    roof: hex,
    accent: hex,
    glow: hex,
  }),
  scene: sceneSchema.optional(),
  /** Optional alternative lighting (the HUD "Night lights" toggle). */
  nightScene: sceneSchema.optional(),
  streets: streetsSchema.optional(),
  lighting: z.object({ preset: z.string() }).passthrough(),
  camera: z.object({
    elevation: z.number(),
    yaw: z.number(),
    minDistance: z.number(),
    maxDistance: z.number(),
  }),
  models: z.record(z.string(), modelSchema),
  props: z.array(propSchema).max(12).optional(),
  preview: z.string().optional(),
});

export type WorldLibrary = z.infer<typeof worldLibrarySchema>;
export type LibraryModel = z.infer<typeof modelSchema>;
export type LibraryScene = z.infer<typeof sceneSchema>;
export type LibraryStreets = z.infer<typeof streetsSchema>;
export type LibraryProp = z.infer<typeof propSchema>;

export type SizeTier = 'tiny' | 'small' | 'large' | 'huge';

/**
 * Maps an EC2-style size (`t3.micro`, `m5.2xlarge`, `db.r6g.large`) to a building size tier:
 * nano and micro are tiny, small and medium are small, large and xlarge are large, 2xlarge and up (or metal) are huge.
 */
export function sizeTierOf(instanceType: unknown): SizeTier | undefined {
  if (typeof instanceType !== 'string') return undefined;
  const size = instanceType.toLowerCase().split('.').pop() ?? '';
  if (size === 'nano' || size === 'micro') return 'tiny';
  if (size === 'small' || size === 'medium') return 'small';
  if (size === 'large' || size === 'xlarge') return 'large';
  if (/^\d+xlarge$/.test(size) || size.startsWith('metal')) return 'huge';
  return undefined;
}

/**
 * Resolves sized type (`aws_instance.large`) -> exact Terraform type -> family model -> generic model.
 * File URLs always use Vite's GitHub Pages base path, never a hard-coded leading slash.
 */
export function resolveLibraryModel(
  library: WorldLibrary | null,
  resourceType: string,
  family: ResourceFamily,
  attributes: Record<string, unknown> = {},
): (LibraryModel & { url: string }) | null {
  if (!library) return null;
  const tier = sizeTierOf(attributes.instance_type ?? attributes.instance_class);
  const model =
    (tier ? library.models[`${resourceType}.${tier}`] : undefined) ??
    library.models[resourceType] ??
    library.models[`family:${family}`] ??
    library.models['family:generic'];
  return model ? { ...model, url: `${import.meta.env.BASE_URL}worlds/${library.id}/${model.file}` } : null;
}

/** URL of a library file such as a prop model. */
export function libraryAssetUrl(library: WorldLibrary, file: string): string {
  return `${import.meta.env.BASE_URL}worlds/${library.id}/${file}`;
}

/** Small safe loader for world manifests served from public/worlds/. Invalid or unavailable libraries fall back to procedural landmarks. */
export async function loadWorldLibrary(
  id: string,
  fetcher: typeof fetch = fetch,
): Promise<WorldLibrary | null> {
  try {
    const response = await fetcher(`${import.meta.env.BASE_URL}worlds/${id}/library.json`);
    if (!response.ok) return null;
    const parsed = worldLibrarySchema.safeParse(await response.json());
    return parsed.success && parsed.data.id === id ? parsed.data : null;
  } catch {
    return null;
  }
}
