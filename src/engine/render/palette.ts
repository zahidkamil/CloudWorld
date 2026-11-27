/** Colours and light settings a world supplies to the shared renderer. World libraries provide them as `scene` and `nightScene` in library.json. */
export interface ScenePalette {
  background: string;
  ground: string;
  /** Island side and underside. */
  earth: string;
  /** Building walls. */
  base: string;
  /** Roofs and frames. Region and AZ tints blend into this. */
  roof: string;
  /** Region accent for the world. Each region gets a rotated version of it. */
  accent: string;
  /** Windows, lamps, and other emissive surfaces. */
  glow: string;
  skyLight: string;
  groundLight: string;
  keyLight: string;
  keyIntensity: number;
  fillIntensity: number;
  /** Small props around island edges. */
  decor: 'blossom' | 'pine';
  /** Fog density multiplier (1 = default distance fog). */
  fog?: number;
}
