import { describe, expect, it } from 'vitest';
import multi from '@/samples/multi-region.plan.json';
import single from '@/samples/single-az.plan.json';
import { importPlan } from '@/engine/graph/importPlan';
import type { InfrastructureGraph } from '@/engine/graph/types';
import { makePlan } from '@/engine/terraform/testPlans';
import { scanGraph } from './scan';
import { CATCH_POINTS, HINT_COST, MIN_CATCH_POINTS, pointsForCatch } from './scoring';

function graphOf(plan: unknown): InfrastructureGraph {
  const result = importPlan(typeof plan === 'string' ? plan : JSON.stringify(plan));
  if (!result.ok) throw new Error(result.error);
  return result.graph;
}

const sgPlan = (ingress: object[]) =>
  makePlan([
    {
      address: 'aws_security_group.test',
      type: 'aws_security_group',
      name: 'test',
      after: { name: 'test', region: 'us-east-1', ingress },
    },
  ]);

describe('security scan', () => {
  it('finds the open SSH rule in the multi-region sample', () => {
    const findings = scanGraph(graphOf(multi));
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      ruleId: 'open-sensitive-port',
      severity: 'high',
      resourceName: 'web-east',
    });
    expect(findings[0]?.evidence).toContain('port 22');
  });

  it('reports no findings for the single-AZ sample (only HTTPS is open)', () => {
    expect(scanGraph(graphOf(single))).toEqual([]);
  });

  it('does not flag web ports, private sources, or rules that are not open to the internet', () => {
    const g = graphOf(
      sgPlan([
        { from_port: 443, to_port: 443, protocol: 'tcp', cidr_blocks: ['0.0.0.0/0'] },
        { from_port: 80, to_port: 80, protocol: 'tcp', cidr_blocks: ['0.0.0.0/0'] },
        { from_port: 22, to_port: 22, protocol: 'tcp', cidr_blocks: ['10.0.0.0/8'] },
      ]),
    );
    expect(scanGraph(g)).toEqual([]);
  });

  it('flags databases and IPv6 exposure as critical, and all-port rules once', () => {
    const g = graphOf(
      sgPlan([
        { from_port: 5432, to_port: 5432, protocol: 'tcp', ipv6_cidr_blocks: ['::/0'] },
        { from_port: 0, to_port: 0, protocol: '-1', cidr_blocks: ['0.0.0.0/0'] },
      ]),
    );
    const findings = scanGraph(g);
    expect(findings.map((f) => f.severity)).toEqual(['critical', 'critical']);
    expect(findings.some((f) => f.title === 'Every port is open to the internet')).toBe(true);
    expect(findings.some((f) => f.title.startsWith('PostgreSQL'))).toBe(true);
  });

  it('is deterministic, and every finding has 3 hints and a correct remediation', () => {
    const g = graphOf(multi);
    expect(JSON.stringify(scanGraph(g))).toBe(JSON.stringify(scanGraph(g)));
    for (const f of scanGraph(g)) {
      expect(f.hints).toHaveLength(3);
      expect(f.remediations.some((r) => r.correct)).toBe(true);
      expect(f.remediations.some((r) => !r.correct)).toBe(true);
    }
  });

  it('does not change the graph', () => {
    const g = graphOf(multi);
    const before = JSON.stringify(g);
    scanGraph(g);
    expect(JSON.stringify(g)).toBe(before);
  });

  it('keeps findings free of raw plan values', () => {
    const text = JSON.stringify(scanGraph(graphOf(multi)));
    expect(text).not.toMatch(/AKIA|ami-0|mock|cloudworld-app/);
  });
});

describe('scoring', () => {
  it('takes points off per hint but never below the minimum', () => {
    expect(pointsForCatch(0)).toBe(CATCH_POINTS);
    expect(pointsForCatch(1)).toBe(CATCH_POINTS - HINT_COST);
    expect(pointsForCatch(3)).toBe(MIN_CATCH_POINTS);
    expect(pointsForCatch(99)).toBe(MIN_CATCH_POINTS);
    expect(pointsForCatch(-4)).toBe(CATCH_POINTS);
  });
});
