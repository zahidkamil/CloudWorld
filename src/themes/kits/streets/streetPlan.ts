import type { LayoutDistrict, LayoutLot } from '@/engine/layout/types';
import { CELL, DISTRICT_PAD } from '@/engine/layout/layout';
import { hashString } from '@/themes/variation';

/**
 * Pure street plan for every district: a ring road with a sidewalk inside it, lane dashes, crosswalks,
 * corner lamps, street trees, and slots for decorative props. It only reads the layout, so it never changes
 * the infrastructure, and the same layout always gives the same streets.
 *
 * The band sits in the district's empty margin (DISTRICT_PAD), clear of every landmark lot.
 */
export const STREET = {
  /** Gap between the district pad edge and the road. */
  curb: 0.05,
  road: 0.8,
  walk: 0.45,
  /** Inset of the district pad from the district edge (see Island.tsx). */
  padInset: 0.15,
} as const;

export interface Strip {
  x: number;
  z: number;
  w: number;
  d: number;
}

export interface Spot {
  x: number;
  z: number;
  /** Rotation about the vertical axis, radians. Models face +Z at 0. */
  rot: number;
}

export interface StreetPlan {
  sidewalks: Strip[];
  roads: Strip[];
  markings: Strip[];
  crosswalks: Strip[];
  lamps: Spot[];
  trees: Spot[];
}

export type PropPlacement = 'road' | 'sidewalk' | 'lot';

interface PropRequest {
  placement: PropPlacement;
  perDistrict: number;
}

type Side = 'top' | 'bottom' | 'left' | 'right';
const SIDES: Side[] = ['top', 'bottom', 'left', 'right'];

const ROAD_LINE = STREET.curb + STREET.road / 2;
const WALK_LINE = STREET.curb + STREET.road + STREET.walk / 2;
const BAND = STREET.curb + STREET.road + STREET.walk;

/** Half sizes of the district pad. */
function half(d: LayoutDistrict) {
  return { hw: d.width / 2 - STREET.padInset, hd: d.depth / 2 - STREET.padInset };
}

/** A point on a side, `inset` in from the pad edge, `along` from the side's middle. */
function pointOn(d: LayoutDistrict, side: Side, inset: number, along: number): { x: number; z: number } {
  const { hw, hd } = half(d);
  switch (side) {
    case 'top':
      return { x: d.x + along, z: d.z - hd + inset };
    case 'bottom':
      return { x: d.x + along, z: d.z + hd - inset };
    case 'left':
      return { x: d.x - hw + inset, z: d.z + along };
    case 'right':
      return { x: d.x + hw - inset, z: d.z + along };
  }
}

function sideLength(d: LayoutDistrict, side: Side): number {
  const { hw, hd } = half(d);
  return side === 'top' || side === 'bottom' ? 2 * hw : 2 * hd;
}

/** Faces the district centre: the model's front (+Z) points inward. */
function inwardRot(side: Side): number {
  return side === 'top' ? 0 : side === 'bottom' ? Math.PI : side === 'left' ? Math.PI / 2 : -Math.PI / 2;
}

/** Positions along a sidewalk between its corner lamps. */
function walkPositions(len: number): number[] {
  const usable = len / 2 - WALK_LINE - 0.9;
  if (usable <= 0) return [0];
  const n = Math.max(1, Math.floor((2 * usable) / 1.5) + 1);
  if (n === 1) return [0];
  return Array.from({ length: n }, (_, i) => -usable + (2 * usable * i) / (n - 1));
}

function shuffled<T>(items: T[], seed: string): T[] {
  return items
    .map((item, i) => ({ item, key: hashString(`${seed}:${i}`) }))
    .sort((a, b) => a.key - b.key)
    .map((e) => e.item);
}

/** Streets for every district. */
export function planStreets(districts: LayoutDistrict[]): StreetPlan {
  const plan: StreetPlan = { sidewalks: [], roads: [], markings: [], crosswalks: [], lamps: [], trees: [] };
  for (const d of districts) {
    const { hw, hd } = half(d);
    // Sidewalk band (the road is drawn on top of its outer part).
    plan.sidewalks.push(
      { x: d.x, z: d.z - hd + BAND / 2, w: 2 * hw, d: BAND },
      { x: d.x, z: d.z + hd - BAND / 2, w: 2 * hw, d: BAND },
      { x: d.x - hw + BAND / 2, z: d.z, w: BAND, d: 2 * hd - 2 * BAND },
      { x: d.x + hw - BAND / 2, z: d.z, w: BAND, d: 2 * hd - 2 * BAND },
    );
    plan.roads.push(
      { x: d.x, z: d.z - hd + ROAD_LINE, w: 2 * hw - 2 * STREET.curb, d: STREET.road },
      { x: d.x, z: d.z + hd - ROAD_LINE, w: 2 * hw - 2 * STREET.curb, d: STREET.road },
      { x: d.x - hw + ROAD_LINE, z: d.z, w: STREET.road, d: 2 * hd - 2 * STREET.curb },
      { x: d.x + hw - ROAD_LINE, z: d.z, w: STREET.road, d: 2 * hd - 2 * STREET.curb },
    );
    for (const side of SIDES) {
      const len = sideLength(d, side);
      const horizontal = side === 'top' || side === 'bottom';
      // Lane dashes, clear of corners and of the crosswalk in the middle.
      for (let a = -len / 2 + 1.2; a <= len / 2 - 1.2; a += 1.0) {
        if (Math.abs(a) < 0.7) continue;
        const p = pointOn(d, side, ROAD_LINE, a);
        plan.markings.push(horizontal ? { ...p, w: 0.42, d: 0.05 } : { ...p, w: 0.05, d: 0.42 });
      }
      for (let i = -2; i <= 2; i += 1) {
        const p = pointOn(d, side, ROAD_LINE, i * 0.17);
        plan.crosswalks.push(
          horizontal ? { ...p, w: 0.09, d: STREET.road * 0.82 } : { ...p, w: STREET.road * 0.82, d: 0.09 },
        );
      }
      const positions = walkPositions(len);
      const mid = Math.floor(positions.length / 2);
      positions.forEach((a, i) => {
        const p = pointOn(d, side, WALK_LINE, a);
        if (positions.length >= 5 && i === mid) plan.lamps.push({ ...p, rot: 0 });
        else if (i % 2 === 0)
          plan.trees.push({ ...p, rot: (hashString(`${d.id}:${side}:${i}`) % 628) / 100 });
      });
    }
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ] as const) {
      plan.lamps.push({ x: d.x + sx * (hw - WALK_LINE), z: d.z + sz * (hd - WALK_LINE), rot: 0 });
    }
  }
  return plan;
}

/** Empty landmark cells inside a district: places for shops and cafés. */
export function freeLots(d: LayoutDistrict, lots: LayoutLot[]): { x: number; z: number }[] {
  const cols = Math.max(1, Math.round((d.width - 2 * DISTRICT_PAD) / CELL));
  const rows = Math.max(1, Math.round((d.depth - 2 * DISTRICT_PAD) / CELL));
  const mine = lots.filter((l) => l.districtId === d.id);
  const out: { x: number; z: number }[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = d.x + (c - (cols - 1) / 2) * CELL;
      const z = d.z + (r - (rows - 1) / 2) * CELL;
      if (mine.every((l) => Math.hypot(l.x - x, l.z - z) > CELL * 0.9)) out.push({ x, z });
    }
  }
  return out;
}

/**
 * Deterministic spots for each prop request, in request order. Road props sit in a lane, sidewalk props
 * face inward between the trees, lot props fill empty landmark cells. Spots are never reused.
 */
export function placeProps(
  districts: LayoutDistrict[],
  lots: LayoutLot[],
  requests: PropRequest[],
): Spot[][] {
  const result: Spot[][] = requests.map(() => []);
  for (const d of districts) {
    const road: Spot[] = [];
    const walk: Spot[] = [];
    for (const side of SIDES) {
      const len = sideLength(d, side);
      const horizontal = side === 'top' || side === 'bottom';
      for (const a of [-0.3 * len, 0.3 * len]) {
        const p = pointOn(d, side, ROAD_LINE, a);
        const forward = hashString(`${d.id}:${side}:${a}`) % 2 === 0;
        road.push({ ...p, rot: (horizontal ? 0 : Math.PI / 2) + (forward ? 0 : Math.PI) });
      }
      walkPositions(len).forEach((a, i) => {
        if (i % 2 === 1) walk.push({ ...pointOn(d, side, WALK_LINE, a), rot: inwardRot(side) });
      });
    }
    const pools: Record<PropPlacement, Spot[]> = {
      road: shuffled(road, `${d.id}:road`),
      sidewalk: shuffled(walk, `${d.id}:walk`),
      lot: shuffled(
        freeLots(d, lots).map((p) => ({ ...p, rot: 0 })),
        `${d.id}:lot`,
      ),
    };
    requests.forEach((req, i) => {
      const pool = pools[req.placement];
      for (let n = 0; n < req.perDistrict && pool.length > 0; n += 1) result[i]!.push(pool.shift()!);
    });
  }
  return result;
}
