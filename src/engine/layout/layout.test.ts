import { describe, expect, it } from 'vitest';
import multi from '@/samples/multi-region.plan.json';
import single from '@/samples/single-az.plan.json';
import { importPlan } from '@/engine/graph/importPlan';
import type { InfrastructureGraph } from '@/engine/graph/types';
import { CELL, layoutGraph } from './layout';

function graphOf(plan: unknown): InfrastructureGraph {
  const result = importPlan(JSON.stringify(plan));
  if (!result.ok) throw new Error(result.error);
  return result.graph;
}

const overlaps = (a: { x: number; z: number; width: number; depth: number }, b: typeof a) =>
  Math.abs(a.x - b.x) < (a.width + b.width) / 2 - 1e-6 &&
  Math.abs(a.z - b.z) < (a.depth + b.depth) / 2 - 1e-6;
const inside = (
  inner: { x: number; z: number },
  outer: { x: number; z: number; width: number; depth: number },
) => Math.abs(inner.x - outer.x) <= outer.width / 2 && Math.abs(inner.z - outer.z) <= outer.depth / 2;

describe('layoutGraph (multi-region sample)', () => {
  const graph = graphOf(multi);
  const layout = layoutGraph(graph);

  it('gives every resource exactly one lot', () => {
    expect(layout.lots).toHaveLength(graph.resources.length);
    expect(new Set(layout.lots.map((l) => l.resourceId)).size).toBe(graph.resources.length);
  });

  it('makes a global hub, one island per region, in a stable order', () => {
    expect(layout.islands.map((i) => i.name)).toEqual(['Global', 'us-east-1', 'us-west-2']);
    expect(layout.islands.map((i) => i.kind)).toEqual(['global', 'region', 'region']);
  });

  it('makes a district for every AZ, plus regional services', () => {
    const east = layout.districts.filter((d) => d.region === 'us-east-1').map((d) => d.name);
    expect(east).toEqual(['Regional services', 'us-east-1a', 'us-east-1b', 'us-east-1c']);
    expect(layout.districts.filter((d) => d.kind === 'az')).toHaveLength(6);
  });

  it('puts zonal resources in their own AZ district and global resources in the hub', () => {
    const districtOf = (id: string) => {
      const lot = layout.lots.find((l) => l.resourceId === id)!;
      return layout.districts.find((d) => d.id === lot.districtId)!;
    };
    expect(districtOf('aws_iam_role.app').kind).toBe('global');
    const ec2 = graph.resources.find((r) => r.type === 'aws_instance' && r.placement.az === 'us-west-2b')!;
    expect(districtOf(ec2.id)).toMatchObject({ kind: 'az', az: 'us-west-2b', region: 'us-west-2' });
  });

  it('keeps lots inside their district, districts inside their island, and nothing overlapping', () => {
    for (const lot of layout.lots) {
      expect(
        inside(
          lot,
          layout.districts.find((d) => d.id === lot.districtId)!,
        ),
      ).toBe(true);
    }
    for (const d of layout.districts) {
      expect(
        inside(
          d,
          layout.islands.find((i) => i.id === d.islandId)!,
        ),
      ).toBe(true);
    }
    const islands = layout.islands;
    islands.forEach((a, i) => islands.slice(i + 1).forEach((b) => expect(overlaps(a, b)).toBe(false)));
    const districts = layout.districts;
    districts.forEach((a, i) =>
      districts.slice(i + 1).forEach((b) => expect(overlaps(a, b), `${a.id} vs ${b.id}`).toBe(false)),
    );
  });

  it('keeps landmarks at least one cell apart', () => {
    for (let i = 0; i < layout.lots.length; i += 1) {
      for (let j = i + 1; j < layout.lots.length; j += 1) {
        const a = layout.lots[i]!;
        const b = layout.lots[j]!;
        expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThanOrEqual(CELL - 1e-6);
      }
    }
  });

  it('is centred on the origin and the bounds contain every island', () => {
    expect((layout.bounds.minX + layout.bounds.maxX) / 2).toBeCloseTo(0, 5);
    expect((layout.bounds.minZ + layout.bounds.maxZ) / 2).toBeCloseTo(0, 5);
    for (const i of layout.islands) {
      expect(i.x - i.width / 2).toBeGreaterThanOrEqual(layout.bounds.minX - 1e-6);
      expect(i.x + i.width / 2).toBeLessThanOrEqual(layout.bounds.maxX + 1e-6);
    }
    expect(layout.bounds.radius).toBeGreaterThan(10);
  });

  it('is deterministic', () => {
    expect(JSON.stringify(layoutGraph(graphOf(multi)))).toBe(JSON.stringify(layout));
  });
});

describe('layoutGraph (other shapes)', () => {
  it('lays out the single-AZ sample as a hub and one region with one AZ', () => {
    const layout = layoutGraph(graphOf(single));
    expect(layout.islands.map((i) => i.name)).toEqual(['Global', 'us-east-1']);
    expect(layout.districts.filter((d) => d.kind === 'az').map((d) => d.name)).toEqual(['us-east-1a']);
  });

  it('handles an empty graph with default bounds', () => {
    const layout = layoutGraph({ resources: [], regions: [] });
    expect(layout.islands).toEqual([]);
    expect(layout.lots).toEqual([]);
    expect(layout.bounds.radius).toBeGreaterThan(0);
  });

  it('puts resources with no region on an Unresolved island at the end', () => {
    const g = graphOf(multi);
    const stray = {
      ...g.resources[0]!,
      id: 'aws_x.stray',
      placement: { scope: 'unresolved' as const, source: 'test' },
    };
    const layout = layoutGraph({ resources: [...g.resources, stray], regions: g.regions });
    expect(layout.islands.at(-1)).toMatchObject({ kind: 'unresolved', name: 'Unresolved' });
    expect(layout.lots.some((l) => l.resourceId === 'aws_x.stray')).toBe(true);
  });
});
