import { parsePlan } from '@/engine/terraform/parse';
import { buildGraph } from './build';
import type { InfrastructureGraph } from './types';

export type ImportResult = { ok: true; graph: InfrastructureGraph } | { ok: false; error: string };

/** Plan JSON text -> graph. The raw text and parsed plan are not retained (R1.7). */
export function importPlan(text: string): ImportResult {
  const parsed = parsePlan(text);
  if (!parsed.ok) return parsed;
  return { ok: true, graph: buildGraph(parsed.plan) };
}
