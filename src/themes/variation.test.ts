import { describe, expect, it } from 'vitest';
import {
  AZ_LIGHTNESS_RANGE,
  azTint,
  hexToHsl,
  hslToHex,
  mixHex,
  regionAccents,
  REGION_HUE_STEP,
} from './variation';

const hueGap = (a: string, b: string) => {
  const d = Math.abs(hexToHsl(a).h - hexToHsl(b).h);
  return Math.min(d, 360 - d);
};

describe('colour helpers', () => {
  it('round-trips hex through HSL', () => {
    for (const hex of ['#5eead4', '#fb923c', '#3c4f9c', '#ffffff', '#000000']) {
      expect(hslToHex(hexToHsl(hex))).toBe(hex);
    }
  });
  it('ignores malformed colours instead of throwing', () => {
    expect(hexToHsl('nope')).toEqual({ h: 0, s: 0, l: 0.5 });
  });
  it('mixes colours', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixHex('#102030', '#102030', 0.7)).toBe('#102030');
  });
});

describe('regionAccents', () => {
  it('gives clearly different accents to neighbouring regions', () => {
    const accents = regionAccents('#f3a6c8', ['us-west-2', 'us-east-1', 'eu-west-1']);
    const list = [...accents.values()];
    expect(list).toHaveLength(3);
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1)
        expect(hueGap(list[i]!, list[j]!)).toBeGreaterThanOrEqual(REGION_HUE_STEP - 3);
    }
  });
  it('is stable: same regions, same colours, any input order', () => {
    const a = regionAccents('#ff9a3c', ['us-east-1', 'us-west-2']);
    const b = regionAccents('#ff9a3c', ['us-west-2', 'us-east-1', 'us-east-1']);
    expect([...a.entries()]).toEqual([...b.entries()]);
  });
  it('is different for a different world accent', () => {
    expect(regionAccents('#ff9a3c', ['r']).get('r')).not.toBe(regionAccents('#52f2ff', ['r']).get('r'));
  });
});

describe('azTint', () => {
  const region = '#5eead4';
  it('changes lightness by at most 6% and stays near the region hue', () => {
    for (const az of ['us-east-1a', 'us-east-1b', 'us-east-1c', 'eu-west-1a']) {
      const tint = hexToHsl(azTint(region, az));
      const base = hexToHsl(region);
      expect(Math.abs(tint.l - base.l)).toBeLessThanOrEqual(AZ_LIGHTNESS_RANGE + 0.01);
      expect(hueGap(azTint(region, az), region)).toBeLessThanOrEqual(4);
    }
  });
  it('is deterministic and differs between AZs', () => {
    expect(azTint(region, 'us-east-1a')).toBe(azTint(region, 'us-east-1a'));
    expect(new Set(['a', 'b', 'c'].map((s) => azTint(region, `us-east-1${s}`))).size).toBeGreaterThan(1);
  });
});
