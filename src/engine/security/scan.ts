import type { InfrastructureGraph } from '@/engine/graph/types';
import { RULES, type SecurityRule } from './rules';
import type { Finding, Severity } from './types';

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

/** Runs every rule. Pure and deterministic: most severe first, then by id. Never modifies the graph. */
export function scanGraph(graph: InfrastructureGraph, rules: readonly SecurityRule[] = RULES): Finding[] {
  const seen = new Set<string>();
  const findings: Finding[] = [];
  for (const rule of rules) {
    for (const f of rule.evaluate(graph)) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      findings.push(f);
    }
  }
  return findings.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.id.localeCompare(b.id),
  );
}
