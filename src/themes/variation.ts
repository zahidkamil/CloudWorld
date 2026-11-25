/** Pure colour helpers for region accents and availability-zone tints. No React, no three. */

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function hexToHsl(hex: string): Hsl {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { h: 0, s: 0, l: 0.5 };
  const n = parseInt(m[1]!, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const hh = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    hh < 60
      ? [c, x, 0]
      : hh < 120
        ? [x, c, 0]
        : hh < 180
          ? [0, c, x]
          : hh < 240
            ? [0, x, c]
            : hh < 300
              ? [x, 0, c]
              : [c, 0, x];
  const to = (v: number) =>
    Math.round(Math.min(Math.max(v + m, 0), 1) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** FNV-1a, 32 bit. Stable across runs and platforms. */
export function hashString(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Hue step between neighbouring regions: large enough that region accents are clearly different. */
export const REGION_HUE_STEP = 62;
/** The most an availability zone may shift lightness from its region (6%). */
export const AZ_LIGHTNESS_RANGE = 0.06;

/**
 * One accent colour per region, derived from the world's accent. Regions are ordered by name and spread around
 * the colour wheel in steps of at least 60 degrees, so the same set of regions always gets the same colours.
 */
export function regionAccents(baseHex: string, regions: readonly string[]): Map<string, string> {
  const base = hexToHsl(baseHex);
  const sorted = [...new Set(regions)].sort();
  const out = new Map<string, string>();
  sorted.forEach((name, i) => {
    const lap = Math.floor((i * REGION_HUE_STEP) / 360);
    out.set(
      name,
      hslToHex({
        h: base.h + i * REGION_HUE_STEP,
        s: Math.min(Math.max(base.s, 0.55), 0.9),
        // Colours that wrap around the wheel shift lightness so they stay apart.
        l: Math.min(Math.max(base.l + lap * 0.08, 0.35), 0.72),
      }),
    );
  });
  return out;
}

/** A subtle per-AZ variation of a region colour: lightness moves by at most ±6%, hue by at most ±3 degrees. */
export function azTint(regionHex: string, az: string): string {
  const hsl = hexToHsl(regionHex);
  const hash = hashString(az);
  const unit = ((hash % 1000) / 999) * 2 - 1; // -1..1
  const hueUnit = (((hash >>> 10) % 1000) / 999) * 2 - 1;
  return hslToHex({
    h: hsl.h + hueUnit * 3,
    s: hsl.s,
    l: Math.min(Math.max(hsl.l + unit * AZ_LIGHTNESS_RANGE, 0), 1),
  });
}

/** Mixes two hex colours. `t` is the share of `b`. */
export function mixHex(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `#${[mix(pa[0], pb[0]), mix(pa[1], pb[1]), mix(pa[2], pb[2])].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
