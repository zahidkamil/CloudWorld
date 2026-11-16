import { describe, expect, it } from 'vitest';
import sample from '@/samples/multi-region.plan.json';
import { makePlan } from '@/engine/terraform/testPlans';
import { importPlan } from './importPlan';
import type { InfrastructureGraph } from './types';

function graphOf(text: string): InfrastructureGraph {
  const r = importPlan(text);
  if (!r.ok) throw new Error(r.error);
  return r.graph;
}
const placement = (g: InfrastructureGraph, id: string) => g.resources.find((r) => r.id === id)!.placement;

describe('bundled multi-region sample', () => {
  const g = graphOf(JSON.stringify(sample));
  const edge = (from: string, to: string, kind?: string) =>
    g.edges.some((e) => e.from === from && e.to === to && (!kind || e.kind === kind));

  it('has two regions with three AZs each and no warnings', () => {
    expect(g.regions.map((r) => [r.name, r.azs.length])).toEqual([
      ['us-east-1', 3],
      ['us-west-2', 3],
    ]);
    expect(g.warnings).toEqual([]);
    expect(g.resources).toHaveLength(60);
  });
  it('puts IAM and Route 53 in the global hub, once', () => {
    expect(placement(g, 'aws_iam_role.app').scope).toBe('global');
    expect(placement(g, 'aws_route53_zone.main').scope).toBe('global');
  });
  it('places instances and subnets in their AZ', () => {
    expect(placement(g, 'aws_instance.web_east[1]')).toMatchObject({ scope: 'az', az: 'us-east-1b' });
    expect(placement(g, 'aws_instance.web_west[0]')).toMatchObject({
      scope: 'az',
      region: 'us-west-2',
      az: 'us-west-2a',
    });
  });
  it('places multi-AZ resources at region level with links to their AZs', () => {
    expect(placement(g, 'aws_lb.east')).toMatchObject({
      scope: 'region',
      azs: ['us-east-1a', 'us-east-1b', 'us-east-1c'],
    });
    expect(placement(g, 'aws_db_instance.east').azs).toHaveLength(3);
  });
  it('resolves references through module outputs and inputs', () => {
    expect(edge('aws_instance.web_east[0]', 'aws_security_group.web_east', 'network')).toBe(true);
    expect(
      edge('aws_instance.web_east[0]', 'module.network_east.aws_subnet.private["us-east-1a"]', 'contains'),
    ).toBe(true);
    expect(
      edge(
        'module.network_east.aws_subnet.public["us-east-1a"]',
        'module.network_east.aws_vpc.this',
        'contains',
      ),
    ).toBe(true);
    expect(edge('aws_security_group.web_east', 'module.network_east.aws_vpc.this', 'contains')).toBe(true);
    expect(edge('aws_lambda_function.worker', 'aws_iam_role.app')).toBe(true);
  });
  it('aligns count.index references one-to-one', () => {
    expect(edge('aws_lb_target_group_attachment.east[1]', 'aws_instance.web_east[1]', 'attached')).toBe(true);
    expect(edge('aws_lb_target_group_attachment.east[1]', 'aws_instance.web_east[0]')).toBe(false);
  });
  it('never links across regions', () => {
    const region = (id: string) => placement(g, id).region;
    for (const e of g.edges) {
      const a = region(e.from);
      const b = e.to.startsWith('var.') ? undefined : region(e.to);
      if (a && b) expect(a).toBe(b);
    }
  });
  it('builds shared groups', () => {
    const sg = g.groups.find((x) => x.id === 'aws_security_group.web_east');
    expect(sg?.kind).toBe('security-group');
    expect(sg?.consumers).toEqual(
      expect.arrayContaining(['aws_instance.web_east[0]', 'aws_lb.east', 'aws_lambda_function.worker']),
    );
    expect(g.groups.some((x) => x.kind === 'variable' && x.id === 'var.environment')).toBe(true);
  });
  it('shows no sensitive or unlisted attributes', () => {
    const json = JSON.stringify(g);
    expect(json).not.toMatch(/mock|user_data|password/i);
    expect(g.resources.find((r) => r.id === 'aws_db_instance.east')!.attributes).toMatchObject({
      engine: 'postgres',
      multi_az: true,
    });
  });
  it('is deterministic', () => {
    expect(graphOf(JSON.stringify(sample))).toEqual(g);
  });
});

describe('topology fallbacks', () => {
  const cfg = (key: string, region: unknown) => ({
    provider_config: { [key]: { expressions: { region } } },
    root_module: { resources: [] },
  });

  it('uses the provider region when the resource has none', () => {
    const g = graphOf(
      makePlan(
        [{ address: 'aws_sqs_queue.q', type: 'aws_sqs_queue', name: 'q', provider_config_key: 'aws.eu' }],
        {
          configuration: cfg('aws.eu', { constant_value: 'eu-west-1' }),
        },
      ),
    );
    expect(placement(g, 'aws_sqs_queue.q')).toMatchObject({
      scope: 'region',
      region: 'eu-west-1',
      source: 'provider region',
    });
  });
  it('resolves a provider region from a safe variable', () => {
    const g = graphOf(
      makePlan(
        [{ address: 'aws_sqs_queue.q', type: 'aws_sqs_queue', name: 'q', provider_config_key: 'aws' }],
        {
          variables: { region: { value: 'ap-south-1' } },
          configuration: cfg('aws', { references: ['var.region'] }),
        },
      ),
    );
    expect(placement(g, 'aws_sqs_queue.q').region).toBe('ap-south-1');
  });
  it('falls back to the ARN region', () => {
    const g = graphOf(
      makePlan([
        {
          address: 'aws_sqs_queue.q',
          type: 'aws_sqs_queue',
          name: 'q',
          after: { arn: 'arn:aws:sqs:eu-central-1:123456789012:q' },
        },
      ]),
    );
    expect(placement(g, 'aws_sqs_queue.q')).toMatchObject({ region: 'eu-central-1', source: 'ARN' });
  });
  it('inherits the region from a parent resource', () => {
    const g = graphOf(
      makePlan(
        [
          { address: 'aws_vpc.v', type: 'aws_vpc', name: 'v', after: { region: 'us-east-2' } },
          { address: 'aws_security_group.s', type: 'aws_security_group', name: 's' },
        ],
        {
          configuration: {
            root_module: {
              resources: [
                {
                  address: 'aws_security_group.s',
                  mode: 'managed',
                  expressions: { vpc_id: { references: ['aws_vpc.v.id', 'aws_vpc.v'] } },
                },
              ],
            },
          },
        },
      ),
    );
    expect(placement(g, 'aws_security_group.s')).toMatchObject({ region: 'us-east-2', source: 'parent vpc' });
  });
  it('puts resources with no information in the unresolved campus and warns', () => {
    const g = graphOf(makePlan([{ address: 'aws_sqs_queue.q', type: 'aws_sqs_queue', name: 'q' }]));
    expect(placement(g, 'aws_sqs_queue.q').scope).toBe('unresolved');
    expect(g.warnings).toContain('1 resource could not be placed in a region.');
  });
  it('shows unregistered aws types with the generic landmark data', () => {
    const g = graphOf(
      makePlan([
        { address: 'aws_glue_job.j', type: 'aws_glue_job', name: 'j', after: { region: 'us-east-1' } },
      ]),
    );
    expect(g.resources[0]).toMatchObject({ category: 'other', label: 'glue job' });
  });
  it('warns above 600 resources', () => {
    const many = Array.from({ length: 601 }, (_, i) => ({
      address: `aws_sqs_queue.q${i}`,
      type: 'aws_sqs_queue',
      name: `q${i}`,
      after: { region: 'us-east-1' },
    }));
    expect(graphOf(makePlan(many)).warnings.join(' ')).toMatch(/601 resources/);
  });
});
