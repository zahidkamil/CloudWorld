import { expect, it } from 'vitest';
import sample from '@/samples/multi-region.plan.json';
import { importPlan } from './importPlan';
import { relationshipsOf } from './relations';
import { summarizeGraph } from './summary';

const r = importPlan(JSON.stringify(sample));
if (!r.ok) throw new Error(r.error);
const graph = r.graph;

it('lists what a resource depends on, what uses it, and its peers', () => {
  const rel = relationshipsOf(graph, 'aws_security_group.web_east');
  expect(rel.dependsOn.map((x) => x.resource.id)).toEqual(['module.network_east.aws_vpc.this']);
  expect(rel.usedBy.map((x) => x.resource.id)).toContain('aws_instance.web_east[2]');
  const inst = relationshipsOf(graph, 'aws_instance.web_east[0]');
  expect(inst.peers.find((p) => p.groupId === 'aws_security_group.web_east')?.others.length).toBeGreaterThan(
    3,
  );
});

it('summarizes regions, global and type counts', () => {
  const s = summarizeGraph(graph);
  expect(s).toMatchObject({ total: 60, global: 2, unresolved: 0 });
  expect(s.byLabel.find((x) => x.label === 'Subnet')?.count).toBe(12);
});
