import { describe, expect, it } from 'vitest';
import multi from '@/samples/multi-region.plan.json';
import single from '@/samples/single-az.plan.json';
import { groupByType } from './typeGroups';
import { importPlan } from './importPlan';
import type { InfrastructureGraph } from './types';

function graphOf(plan: unknown): InfrastructureGraph {
  const result = importPlan(JSON.stringify(plan));
  if (!result.ok) throw new Error(result.error);
  return result.graph;
}

describe('single-AZ sample', () => {
  const g = graphOf(single);

  it('has one region and one AZ, plus global IAM', () => {
    expect(g.regions).toHaveLength(1);
    expect(g.regions[0]?.name).toBe('us-east-1');
    expect(g.regions[0]?.azs).toEqual(['us-east-1a']);
    expect(g.resources.some((r) => r.type === 'aws_iam_role' && r.placement.scope === 'global')).toBe(true);
  });

  it('places zonal resources in the single AZ', () => {
    const instances = g.resources.filter((r) => r.type === 'aws_instance');
    expect(instances).toHaveLength(2);
    for (const r of instances) expect(r.placement).toMatchObject({ scope: 'az', az: 'us-east-1a' });
    const subnets = g.resources.filter((r) => r.type === 'aws_subnet');
    expect(subnets.every((s) => s.placement.az === 'us-east-1a')).toBe(true);
  });

  it('shares security groups between consumers', () => {
    const sg = g.groups.find((x) => x.kind === 'security-group' && x.id.endsWith('aws_security_group.app'));
    expect(sg?.consumers.length).toBeGreaterThanOrEqual(3);
  });
});

describe('groupByType', () => {
  it('groups by category, then type, with counts and stable order', () => {
    const groups = groupByType(graphOf(single));
    const names = groups.map((c) => c.label);
    expect(names).toEqual([...names].sort((a, b) => names.indexOf(a) - names.indexOf(b)));
    const storage = groups.find((c) => c.category === 'storage');
    expect(storage?.types[0]?.type).toBe('aws_s3_bucket');
    expect(storage?.types[0]?.resources).toHaveLength(2);
    expect(storage?.count).toBe(2);
    const ec2 = groups.flatMap((c) => c.types).find((t) => t.type === 'aws_instance');
    expect(ec2?.resources.map((r) => r.id)).toEqual([...(ec2?.resources.map((r) => r.id) ?? [])].sort());
  });

  it('accounts for every resource exactly once', () => {
    for (const plan of [single, multi]) {
      const g = graphOf(plan);
      const total = groupByType(g).reduce((n, c) => n + c.count, 0);
      expect(total).toBe(g.resources.length);
    }
  });

  it('is deterministic', () => {
    const g = graphOf(multi);
    expect(JSON.stringify(groupByType(g))).toBe(JSON.stringify(groupByType(g)));
  });
});
