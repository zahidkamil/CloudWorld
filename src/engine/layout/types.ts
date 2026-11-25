/** All layout values are in world units (1 unit is about 1 metre). x runs right, z runs toward the viewer. */

export type IslandKind = 'global' | 'region' | 'unresolved';
export type DistrictKind = 'global' | 'regional' | 'az' | 'unresolved';

export interface LayoutIsland {
  id: string;
  kind: IslandKind;
  /** Region name such as `us-east-1`, `Global`, or `Unresolved`. */
  name: string;
  /** Centre of the island. */
  x: number;
  z: number;
  width: number;
  depth: number;
}

export interface LayoutDistrict {
  id: string;
  islandId: string;
  kind: DistrictKind;
  /** Display name: `us-east-1a`, `Regional services`, `Account-wide`, or `No region found`. */
  name: string;
  region?: string;
  az?: string;
  x: number;
  z: number;
  width: number;
  depth: number;
}

export interface LayoutLot {
  resourceId: string;
  districtId: string;
  x: number;
  z: number;
}

export interface LayoutBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  /** Half of the diagonal: a safe radius for fitting a camera. */
  radius: number;
}

export interface WorldLayout {
  islands: LayoutIsland[];
  districts: LayoutDistrict[];
  lots: LayoutLot[];
  bounds: LayoutBounds;
}
