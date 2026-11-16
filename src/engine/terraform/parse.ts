import {
  MAX_PLAN_BYTES,
  type ConfigModule,
  type ConfigResource,
  type ParseResult,
  type ParsedPlan,
  type PlanAction,
  type PlanResource,
  type ProviderConfig,
} from './types';

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asString = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);

/** Keys that commonly carry secrets even when Terraform did not mark them sensitive. */
const SECRET_KEY = /password|secret|token|private_key|access_key|credential|user_data/i;

/**
 * Removes values Terraform marked sensitive (`mask` mirrors the value's shape) and secret-looking keys.
 * Returns undefined when the whole value is sensitive.
 */
export function sanitize(value: unknown, mask: unknown): unknown {
  if (mask === true) return undefined;
  if (Array.isArray(value)) {
    const masks = Array.isArray(mask) ? mask : [];
    return value.map((item, i) => sanitize(item, masks[i])).filter((v) => v !== undefined);
  }
  if (isRec(value)) {
    const masks = isRec(mask) ? mask : {};
    const out: Rec = {};
    for (const [key, item] of Object.entries(value)) {
      if (SECRET_KEY.test(key)) continue;
      const clean = sanitize(item, masks[key]);
      if (clean !== undefined) out[key] = clean;
    }
    return out;
  }
  return value;
}

function actionOf(actions: unknown): PlanAction {
  const list = asArray(actions).filter((a): a is string => typeof a === 'string');
  if (list.length === 2 && list.includes('delete') && list.includes('create')) return 'replace';
  const first = list[0];
  if (first === 'create' || first === 'update' || first === 'delete' || first === 'read') return first;
  return 'no-op';
}

function moduleOfAddress(address: string): string | undefined {
  const match = /^((?:module\.[^.[]+(?:\[[^\]]*\])?\.)+)/.exec(address);
  return match ? match[1]!.slice(0, -1) : undefined;
}

function collectResources(root: Rec, warnings: string[]): PlanResource[] {
  const out: PlanResource[] = [];
  let skippedNonAws = 0;
  const push = (r: Rec, action: PlanAction, values: unknown, mask: unknown) => {
    const type = asString(r.type);
    const address = asString(r.address);
    if (!type || !address || r.mode === 'data') return;
    if (!type.startsWith('aws_')) {
      skippedNonAws += 1;
      return;
    }
    const index = typeof r.index === 'string' || typeof r.index === 'number' ? r.index : undefined;
    const clean = sanitize(isRec(values) ? values : {}, mask);
    out.push({
      address,
      type,
      name: asString(r.name) ?? type,
      module: asString(r.module_address) ?? moduleOfAddress(address),
      index,
      action,
      providerConfigKey: asString(r.provider_config_key),
      values: isRec(clean) ? clean : {},
    });
  };

  const changes = asArray(root.resource_changes).filter(isRec);
  if (changes.length > 0) {
    for (const rc of changes) {
      const change = isRec(rc.change) ? rc.change : {};
      const action = actionOf(change.actions);
      const useAfter = change.after !== null && change.after !== undefined;
      push(
        rc,
        action,
        useAfter ? change.after : change.before,
        useAfter ? change.after_sensitive : change.before_sensitive,
      );
    }
  } else {
    const walk = (mod: unknown) => {
      if (!isRec(mod)) return;
      for (const r of asArray(mod.resources).filter(isRec)) push(r, 'no-op', r.values, r.sensitive_values);
      for (const child of asArray(mod.child_modules)) walk(child);
    };
    const planned = isRec(root.planned_values) ? root.planned_values : isRec(root.values) ? root.values : {};
    walk(planned.root_module);
  }
  if (skippedNonAws > 0) {
    warnings.push(`${skippedNonAws} non-AWS resource${skippedNonAws === 1 ? '' : 's'} skipped (AWS only).`);
  }
  return out;
}

function flatten(expr: unknown, field: string, out: { field: string; references: string[] }[]) {
  if (Array.isArray(expr)) {
    for (const item of expr) flatten(item, field, out);
  } else if (isRec(expr)) {
    if (Array.isArray(expr.references)) {
      const references = expr.references.filter((r): r is string => typeof r === 'string');
      if (references.length > 0) out.push({ field, references });
    } else {
      for (const [key, value] of Object.entries(expr)) flatten(value, key, out);
    }
  }
}

function referencesOf(expr: unknown): string[] {
  const out: { field: string; references: string[] }[] = [];
  flatten(expr, '', out);
  return out.flatMap((x) => x.references);
}

function collectConfig(root: Rec) {
  const configResources: ConfigResource[] = [];
  const modules: ConfigModule[] = [];
  const config = isRec(root.configuration) ? root.configuration : {};

  const walk = (mod: unknown, path: string, inputs: Record<string, string[]>) => {
    if (!isRec(mod)) return;
    const prefix = path ? `${path}.` : '';
    for (const r of asArray(mod.resources).filter(isRec)) {
      const address = asString(r.address);
      if (!address || r.mode === 'data') continue;
      const expressions: { field: string; references: string[] }[] = [];
      for (const [field, expr] of Object.entries(isRec(r.expressions) ? r.expressions : {})) {
        flatten(expr, field, expressions);
      }
      configResources.push({ base: prefix + address, modulePath: path, expressions });
    }
    const outputs: Record<string, string[]> = {};
    for (const [name, out] of Object.entries(isRec(mod.outputs) ? mod.outputs : {})) {
      outputs[name] = isRec(out) ? referencesOf(out.expression) : [];
    }
    modules.push({ path, outputs, inputs });
    for (const [name, call] of Object.entries(isRec(mod.module_calls) ? mod.module_calls : {})) {
      if (!isRec(call)) continue;
      const callInputs: Record<string, string[]> = {};
      for (const [key, expr] of Object.entries(isRec(call.expressions) ? call.expressions : {})) {
        callInputs[key] = referencesOf(expr);
      }
      walk(call.module, `${prefix}module.${name}`, callInputs);
    }
  };
  walk(config.root_module, '', {});
  return { configResources, modules };
}

function collectProviders(root: Rec, variables: ParsedPlan['variables']) {
  const providers: Record<string, ProviderConfig> = {};
  const config = isRec(root.configuration) ? root.configuration : {};
  for (const [key, p] of Object.entries(isRec(config.provider_config) ? config.provider_config : {})) {
    if (!isRec(p) || !isRec(p.expressions)) continue;
    const region = p.expressions.region;
    if (!isRec(region)) continue;
    const entry: ProviderConfig = {};
    if (typeof region.constant_value === 'string') entry.region = region.constant_value;
    const ref = asArray(region.references).find(
      (r): r is string => typeof r === 'string' && r.startsWith('var.'),
    );
    if (ref) {
      entry.regionVariable = ref.slice(4);
      const value = variables[entry.regionVariable];
      if (typeof value === 'string' && !entry.region) entry.region = value;
    }
    providers[key] = entry;
  }
  return providers;
}

function collectVariables(root: Rec): ParsedPlan['variables'] {
  const out: ParsedPlan['variables'] = {};
  const config = isRec(root.configuration) ? root.configuration : {};
  const declared =
    isRec(config.root_module) && isRec(config.root_module.variables) ? config.root_module.variables : {};
  for (const [name, v] of Object.entries(isRec(root.variables) ? root.variables : {})) {
    const decl = declared[name];
    if (isRec(decl) && decl.sensitive === true) continue;
    const value = isRec(v) ? v.value : undefined;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
      out[name] = value;
  }
  return out;
}

/** Parses the text of `terraform show -json <plan>` output. Pure; never logs or stores the input. */
export function parsePlan(text: string): ParseResult {
  if (text.length > MAX_PLAN_BYTES) {
    return { ok: false, error: 'This file is larger than 15 MB. Trim the plan or split it by workspace.' };
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: 'This is not valid JSON. Paste the output of `terraform show -json <planfile>`.',
    };
  }
  if (!isRec(json)) {
    return { ok: false, error: 'Expected a JSON object from `terraform show -json <planfile>`.' };
  }
  const version = asString(json.format_version);
  if (!version) {
    return {
      ok: false,
      error:
        'This does not look like a Terraform plan: format_version is missing. Use `terraform show -json <planfile>`.',
    };
  }
  const major = /^(\d+)\./.exec(version)?.[1];
  if (major !== '1') {
    return { ok: false, error: `Unsupported plan format_version "${version}". CloudWorld supports 1.x.` };
  }
  if (!('resource_changes' in json) && !('planned_values' in json) && !('values' in json)) {
    return {
      ok: false,
      error:
        'No planned resources found. Create the plan with `terraform plan -out=planfile`, then run `terraform show -json planfile`.',
    };
  }

  const warnings: string[] = [];
  const resources = collectResources(json, warnings);
  const variables = collectVariables(json);
  const { configResources, modules } = collectConfig(json);
  if (configResources.length === 0 && resources.length > 0) {
    warnings.push('The plan has no configuration section, so relationships may be incomplete.');
  }
  return {
    ok: true,
    plan: {
      terraformVersion: asString(json.terraform_version),
      resources,
      configResources,
      modules,
      providers: collectProviders(json, variables),
      variables,
      warnings,
    },
  };
}
