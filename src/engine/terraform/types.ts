export type PlanAction = 'create' | 'update' | 'delete' | 'replace' | 'no-op' | 'read';

/** A managed resource instance from a plan, with sensitive values already removed. */
export interface PlanResource {
  address: string;
  type: string;
  name: string;
  /** e.g. `module.network_east`. */
  module?: string;
  index?: string | number;
  action: PlanAction;
  providerConfigKey?: string;
  /** Sanitized planned values. Never persisted or logged. */
  values: Record<string, unknown>;
}

export interface ConfigExpression {
  references: string[];
  constant?: unknown;
}

/** Configuration for one resource block (not one instance), keyed by its module-qualified base address. */
export interface ConfigResource {
  base: string;
  modulePath: string;
  /** Flattened expressions: field name -> expression. */
  expressions: { field: string; references: string[] }[];
}

export interface ConfigModule {
  /** `module.a.module.b`, empty for root. */
  path: string;
  /** Output name -> references in its expression. */
  outputs: Record<string, string[]>;
  /** Module input name -> references in the parent's call expression. */
  inputs: Record<string, string[]>;
}

export interface ProviderConfig {
  region?: string;
  regionVariable?: string;
}

export interface ParsedPlan {
  terraformVersion?: string;
  resources: PlanResource[];
  configResources: ConfigResource[];
  modules: ConfigModule[];
  providers: Record<string, ProviderConfig>;
  /** Root variable values. Sensitive variables are omitted. */
  variables: Record<string, string | number | boolean>;
  warnings: string[];
}

export type ParseResult = { ok: true; plan: ParsedPlan } | { ok: false; error: string };

export const MAX_PLAN_BYTES = 15 * 1024 * 1024;
export const PERFORMANCE_WARNING_RESOURCES = 600;
