import { CATEGORY_LABELS } from '@/engine/graph/typeGroups';
import type { CloudResource, InfrastructureGraph } from '@/engine/graph/types';
import type { LayoutBounds, LayoutDistrict, LayoutIsland, LayoutLot, WorldLayout } from './types';

/** Spacing between neighbouring landmarks. */
export const CELL = 3.2;
/** Empty margin inside a district around its landmarks. */
export const DISTRICT_PAD = 1.3;
/** Smallest district, so empty AZs still read as a place. */
export const MIN_DISTRICT = 6.4;
/** Gap between districts on an island. */
export const DISTRICT_GAP = 1.1;
/** Margin between the districts and the island edge. */
export const ISLAND_PAD = 2;
/** Gap between islands. */
export const ISLAND_GAP = 5;
const MAX_LOT_COLUMNS = 5;
const DISTRICTS_PER_ROW = 3;
const ISLANDS_PER_ROW = 3;

interface Box {
  width: number;
  depth: number;
}

/** Places boxes in rows left to right. Returns each box's centre relative to the block's own centre, plus the block size. */
function packRows(
  boxes: Box[],
  perRow: number,
  gap: number,
): { centres: { x: number; z: number }[]; width: number; depth: number } {
  const rows: number[][] = [];
  boxes.forEach((_, i) => {
    if (i % perRow === 0) rows.push([]);
    rows[rows.length - 1]!.push(i);
  });
  const rowWidth = rows.map((r) => r.reduce((w, i) => w + boxes[i]!.width, 0) + gap * (r.length - 1));
  const rowDepth = rows.map((r) => Math.max(...r.map((i) => boxes[i]!.depth)));
  const width = Math.max(0, ...rowWidth);
  const depth = rowDepth.reduce((d, v) => d + v, 0) + gap * Math.max(rows.length - 1, 0);
  const centres: { x: number; z: number }[] = new Array(boxes.length);
  let z = -depth / 2;
  rows.forEach((row, ri) => {
    let x = -rowWidth[ri]! / 2;
    for (const i of row) {
      const b = boxes[i]!;
      centres[i] = { x: x + b.width / 2, z: z + rowDepth[ri]! / 2 };
      x += b.width + gap;
    }
    z += rowDepth[ri]! + gap;
  });
  return { centres, width, depth };
}

const categoryRank = (r: CloudResource) => Object.keys(CATEGORY_LABELS).indexOf(r.category);

/** Stable order inside a district: category, then type label, then address. */
function sortedForDistrict(resources: CloudResource[]): CloudResource[] {
  return [...resources].sort(
    (a, b) => categoryRank(a) - categoryRank(b) || a.label.localeCompare(b.label) || a.id.localeCompare(b.id),
  );
}

interface DistrictDraft {
  id: string;
  kind: LayoutDistrict['kind'];
  name: string;
  region?: string;
  az?: string;
  resources: CloudResource[];
  columns: number;
  rows: number;
  width: number;
  depth: number;
}

function draftDistrict(
  base: Pick<DistrictDraft, 'id' | 'kind' | 'name' | 'region' | 'az'>,
  resources: CloudResource[],
): DistrictDraft {
  const sorted = sortedForDistrict(resources);
  const columns = Math.min(MAX_LOT_COLUMNS, Math.max(1, Math.ceil(Math.sqrt(sorted.length))));
  const rows = Math.max(1, Math.ceil(sorted.length / columns));
  return {
    ...base,
    resources: sorted,
    columns,
    rows,
    width: Math.max(MIN_DISTRICT, columns * CELL + 2 * DISTRICT_PAD),
    depth: Math.max(MIN_DISTRICT, rows * CELL + 2 * DISTRICT_PAD),
  };
}

interface IslandDraft {
  id: string;
  kind: LayoutIsland['kind'];
  name: string;
  districts: DistrictDraft[];
}

/**
 * Deterministic world layout: a global hub, one island per region with a district per availability zone
 * (plus one for regional services), and an "Unresolved" island when placement could not be determined.
 * Pure function of the graph: the same graph always yields the same layout.
 */
export function layoutGraph(graph: Pick<InfrastructureGraph, 'resources' | 'regions'>): WorldLayout {
  const drafts: IslandDraft[] = [];

  const global = graph.resources.filter((r) => r.placement.scope === 'global');
  if (global.length) {
    drafts.push({
      id: 'island:global',
      kind: 'global',
      name: 'Global',
      districts: [draftDistrict({ id: 'district:global', kind: 'global', name: 'Account-wide' }, global)],
    });
  }

  for (const region of [...graph.regions].sort((a, b) => a.name.localeCompare(b.name))) {
    const inRegion = graph.resources.filter((r) => r.placement.region === region.name);
    const districts: DistrictDraft[] = [];
    const regional = inRegion.filter((r) => r.placement.scope === 'region');
    if (regional.length) {
      districts.push(
        draftDistrict(
          {
            id: `district:${region.name}:regional`,
            kind: 'regional',
            name: 'Regional services',
            region: region.name,
          },
          regional,
        ),
      );
    }
    for (const az of region.azs) {
      districts.push(
        draftDistrict(
          { id: `district:${region.name}:${az}`, kind: 'az', name: az, region: region.name, az },
          inRegion.filter((r) => r.placement.scope === 'az' && r.placement.az === az),
        ),
      );
    }
    if (districts.length)
      drafts.push({ id: `island:${region.name}`, kind: 'region', name: region.name, districts });
  }

  const unresolved = graph.resources.filter((r) => r.placement.scope === 'unresolved');
  if (unresolved.length) {
    drafts.push({
      id: 'island:unresolved',
      kind: 'unresolved',
      name: 'Unresolved',
      districts: [
        draftDistrict({ id: 'district:unresolved', kind: 'unresolved', name: 'No region found' }, unresolved),
      ],
    });
  }

  // Pack districts inside each island, then pack islands into the world.
  const packedIslands = drafts.map((island) => {
    const packed = packRows(island.districts, DISTRICTS_PER_ROW, DISTRICT_GAP);
    return {
      island,
      packed,
      width: packed.width + 2 * ISLAND_PAD,
      depth: packed.depth + 2 * ISLAND_PAD,
    };
  });
  const world = packRows(packedIslands, ISLANDS_PER_ROW, ISLAND_GAP);

  const islands: LayoutIsland[] = [];
  const districts: LayoutDistrict[] = [];
  const lots: LayoutLot[] = [];
  packedIslands.forEach((p, i) => {
    const centre = world.centres[i]!;
    islands.push({
      id: p.island.id,
      kind: p.island.kind,
      name: p.island.name,
      x: centre.x,
      z: centre.z,
      width: p.width,
      depth: p.depth,
    });
    p.island.districts.forEach((d, di) => {
      const dc = p.packed.centres[di]!;
      const dx = centre.x + dc.x;
      const dz = centre.z + dc.z;
      districts.push({
        id: d.id,
        islandId: p.island.id,
        kind: d.kind,
        name: d.name,
        region: d.region,
        az: d.az,
        x: dx,
        z: dz,
        width: d.width,
        depth: d.depth,
      });
      d.resources.forEach((r, ri) => {
        const col = ri % d.columns;
        const row = Math.floor(ri / d.columns);
        // Centre the grid, including a last row that is not full.
        const inRow = row === d.rows - 1 ? d.resources.length - row * d.columns : d.columns;
        lots.push({
          resourceId: r.id,
          districtId: d.id,
          x: dx + (col - (inRow - 1) / 2) * CELL,
          z: dz + (row - (d.rows - 1) / 2) * CELL,
        });
      });
    });
  });

  return { islands, districts, lots, bounds: boundsOf(islands) };
}

function boundsOf(islands: LayoutIsland[]): LayoutBounds {
  if (islands.length === 0) return { minX: -8, maxX: 8, minZ: -8, maxZ: 8, radius: 11.4 };
  const minX = Math.min(...islands.map((i) => i.x - i.width / 2));
  const maxX = Math.max(...islands.map((i) => i.x + i.width / 2));
  const minZ = Math.min(...islands.map((i) => i.z - i.depth / 2));
  const maxZ = Math.max(...islands.map((i) => i.z + i.depth / 2));
  return { minX, maxX, minZ, maxZ, radius: Math.hypot(maxX - minX, maxZ - minZ) / 2 };
}
