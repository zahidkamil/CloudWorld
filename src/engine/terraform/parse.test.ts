import { describe, expect, it } from 'vitest';
import { parsePlan } from './parse';
import { makePlan } from './testPlans';

function ok(text: string) {
  const r = parsePlan(text);
  if (!r.ok) throw new Error(r.error);
  return r.plan;
}

describe('parsePlan validation', () => {
  it('rejects invalid JSON with guidance', () => {
    const r = parsePlan('{nope');
    expect(r).toMatchObject({ ok: false });
    expect(!r.ok && r.error).toMatch(/not valid JSON/);
  });
  it('rejects JSON that is not an object', () => {
    expect(parsePlan('[1,2]')).toMatchObject({ ok: false });
  });
  it('rejects a missing format_version', () => {
    const r = parsePlan('{"resource_changes":[]}');
    expect(!r.ok && r.error).toMatch(/format_version is missing/);
  });
  it('rejects an unsupported major version', () => {
    const r = parsePlan(makePlan([], { format_version: '2.0' }));
    expect(!r.ok && r.error).toMatch(/Unsupported plan format_version "2.0"/);
  });
  it('accepts other 1.x versions', () => {
    expect(parsePlan(makePlan([], { format_version: '1.9' })).ok).toBe(true);
  });
  it('rejects JSON without planned resources', () => {
    const r = parsePlan('{"format_version":"1.2"}');
    expect(!r.ok && r.error).toMatch(/No planned resources/);
  });
  it('rejects input above 15 MB', () => {
    const r = parsePlan('x'.repeat(15 * 1024 * 1024 + 1));
    expect(!r.ok && r.error).toMatch(/15 MB/);
  });
});

describe('parsePlan resources', () => {
  it('keeps count and for_each indexes, modules, and actions', () => {
    const plan = ok(
      makePlan([
        { address: 'aws_instance.web[0]', type: 'aws_instance', name: 'web', index: 0 },
        {
          address: 'module.net.aws_subnet.s["a"]',
          type: 'aws_subnet',
          name: 's',
          index: 'a',
          module_address: 'module.net',
          actions: ['delete', 'create'],
        },
      ]),
    );
    expect(plan.resources.map((r) => [r.address, r.index, r.module, r.action])).toEqual([
      ['aws_instance.web[0]', 0, undefined, 'create'],
      ['module.net.aws_subnet.s["a"]', 'a', 'module.net', 'replace'],
    ]);
  });
  it('skips data sources and warns about non-AWS resources', () => {
    const plan = ok(
      makePlan([
        { address: 'data.aws_ami.x', type: 'aws_ami', name: 'x', mode: 'data' },
        { address: 'google_compute_instance.a', type: 'google_compute_instance', name: 'a' },
        { address: 'aws_vpc.v', type: 'aws_vpc', name: 'v' },
      ]),
    );
    expect(plan.resources.map((r) => r.address)).toEqual(['aws_vpc.v']);
    expect(plan.warnings).toContain('1 non-AWS resource skipped (AWS only).');
  });
  it('omits unknown values instead of inventing them', () => {
    const plan = ok(
      makePlan([{ address: 'aws_vpc.v', type: 'aws_vpc', name: 'v', after: { cidr_block: '10.0.0.0/16' } }]),
    );
    expect(plan.resources[0]!.values).toEqual({ cidr_block: '10.0.0.0/16' });
  });
  it('reads before-values for deleted resources', () => {
    const text = JSON.stringify({
      format_version: '1.2',
      resource_changes: [
        {
          address: 'aws_vpc.v',
          mode: 'managed',
          type: 'aws_vpc',
          name: 'v',
          change: { actions: ['delete'], before: { cidr_block: '10.0.0.0/16' }, after: null },
        },
      ],
    });
    expect(ok(text).resources[0]).toMatchObject({ action: 'delete', values: { cidr_block: '10.0.0.0/16' } });
  });
  it('falls back to planned_values when there are no resource_changes', () => {
    const text = JSON.stringify({
      format_version: '1.0',
      planned_values: {
        root_module: {
          resources: [
            {
              address: 'aws_vpc.v',
              mode: 'managed',
              type: 'aws_vpc',
              name: 'v',
              values: { cidr_block: '10.0.0.0/16' },
            },
          ],
          child_modules: [
            {
              address: 'module.a',
              resources: [
                {
                  address: 'module.a.aws_s3_bucket.b',
                  mode: 'managed',
                  type: 'aws_s3_bucket',
                  name: 'b',
                  values: {},
                },
              ],
            },
          ],
        },
      },
    });
    const plan = ok(text);
    expect(plan.resources.map((r) => [r.address, r.module, r.action])).toEqual([
      ['aws_vpc.v', undefined, 'no-op'],
      ['module.a.aws_s3_bucket.b', 'module.a', 'no-op'],
    ]);
  });
});

describe('parsePlan sensitive values', () => {
  it('drops values Terraform marked sensitive and secret-looking keys', () => {
    const plan = ok(
      makePlan(
        [
          {
            address: 'aws_db_instance.d',
            type: 'aws_db_instance',
            name: 'd',
            after: {
              engine: 'postgres',
              password: 'hunter2',
              connection: { host: 'h', token: 'abc' },
              settings: [{ note: 'visible', value: 'masked-by-terraform' }],
              user_data: 'export KEY=1',
            },
            after_sensitive: { settings: [{ value: true }] },
          },
        ],
        {},
      ),
    );
    const json = JSON.stringify(plan);
    expect(json).not.toMatch(/hunter2|masked-by-terraform|export KEY|"abc"/);
    expect(plan.resources[0]!.values).toEqual({
      engine: 'postgres',
      connection: { host: 'h' },
      settings: [{ note: 'visible' }],
    });
  });
  it('omits sensitive root variables', () => {
    const plan = ok(
      makePlan([], {
        variables: { env: { value: 'prod' }, db_pass: { value: 'hunter2' } },
        configuration: { root_module: { variables: { db_pass: { sensitive: true } } } },
      }),
    );
    expect(plan.variables).toEqual({ env: 'prod' });
  });
});
