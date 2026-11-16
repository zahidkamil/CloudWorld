/** Small hand-written plan fragments for engine tests. */
type Rec = Record<string, unknown>;

export interface TestResource {
  address: string;
  type: string;
  name: string;
  index?: string | number;
  module_address?: string;
  mode?: string;
  actions?: string[];
  after?: Rec;
  after_sensitive?: Rec;
  provider_config_key?: string;
}

export function makePlan(
  resources: TestResource[],
  extra: { configuration?: Rec; variables?: Rec; format_version?: string } = {},
): string {
  return JSON.stringify({
    format_version: extra.format_version ?? '1.2',
    terraform_version: '1.9.0',
    variables: extra.variables ?? {},
    resource_changes: resources.map((r) => ({
      address: r.address,
      mode: r.mode ?? 'managed',
      type: r.type,
      name: r.name,
      index: r.index,
      module_address: r.module_address,
      provider_config_key: r.provider_config_key,
      change: {
        actions: r.actions ?? ['create'],
        before: null,
        after: r.after ?? {},
        after_sensitive: r.after_sensitive ?? {},
      },
    })),
    configuration: extra.configuration ?? { root_module: { resources: [] } },
  });
}
