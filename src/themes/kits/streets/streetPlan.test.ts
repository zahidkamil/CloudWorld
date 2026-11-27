import { describe, expect, it } from 'vitest';
import { CELL } from '@/engine/layout/layout';
import type { LayoutDistrict, LayoutLot } from '@/engine/layout/types';
import { freeLots, placeProps, planStreets, STREET } from './streetPlan';

const district = (id: string, x: number, width = 9, depth = 6.4): LayoutDistrict => ({
  id,
  islandId: 'island:test',
  kind: 'az',
  name: id,
  x,
  z: 0,
  width,
  depth,
});

describe('street plan', () => {
  const a = district('a', 0);
  const b = district('b', 20, 6.4, 6.4);
  const lots: LayoutLot[] = [
    { resourceId: 'r1', districtId: 'a', x: -CELL / 2, z: 0 },
    { resourceId: 'r2', districtId: 'a', x: CELL / 2, z: 0 },
  ];

  it('draws a ring road, sidewalks, crosswalks and corner lamps for each district', () => {
    const plan = planStreets([a, b]);
    expect(plan.roads).toHaveLength(8);
    expect(plan.sidewalks).toHaveLength(8);
    expect(plan.crosswalks).toHaveLength(2 * 4 * 5);
    expect(plan.lamps.length).toBeGreaterThanOrEqual(8);
  });

  it('keeps the street band clear of landmark lots', () => {
    const band = STREET.curb + STREET.road + STREET.walk + STREET.padInset;
    // The nearest landmark edge (lot centre minus a 2.44 m footprint half) stays inside the band.
    const lotEdge = Math.min(...lots.map((l) => a.depth / 2 - Math.abs(l.z))) - 1.22;
    expect(lotEdge).toBeGreaterThan(band);
  });

  it('is deterministic', () => {
    expect(planStreets([a, b])).toEqual(planStreets([a, b]));
    const requests = [
      { placement: 'road' as const, perDistrict: 3 },
      { placement: 'sidewalk' as const, perDistrict: 1 },
      { placement: 'lot' as const, perDistrict: 1 },
    ];
    expect(placeProps([a, b], lots, requests)).toEqual(placeProps([a, b], lots, requests));
  });

  it('puts lot props only in empty cells and never reuses a spot', () => {
    expect(freeLots(a, lots)).toHaveLength(0);
    expect(freeLots(b, [])).toEqual([{ x: 20, z: 0 }]);
    const [cabs, more, cafes] = placeProps([a, b], lots, [
      { placement: 'road', perDistrict: 5 },
      { placement: 'road', perDistrict: 5 },
      { placement: 'lot', perDistrict: 2 },
    ]);
    expect(cafes).toEqual([{ x: 20, z: 0, rot: 0 }]);
    const keys = [...cabs!, ...more!].map((s) => `${s.x.toFixed(2)},${s.z.toFixed(2)}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.length).toBe(16);
  });
});
