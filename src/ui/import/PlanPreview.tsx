import type { InfrastructureGraph } from '@/engine/graph/types';
import { summarizeGraph } from '@/engine/graph/summary';

export function PlanPreview({ graph }: { graph: InfrastructureGraph }) {
  const s = summarizeGraph(graph);
  return (
    <section className="plan-preview" aria-label="Plan preview">
      <p className="plan-preview__total">
        <strong>{s.total}</strong> resources in <strong>{s.regions.length}</strong>{' '}
        {s.regions.length === 1 ? 'region' : 'regions'}
      </p>
      <ul className="plan-preview__regions">
        {s.regions.map((r) => (
          <li key={r.name}>
            <strong>{r.name}</strong>
            <span>
              {r.resourceCount} resources · {r.azs.length} {r.azs.length === 1 ? 'AZ' : 'AZs'}
              {r.azs.length > 0 ? ` (${r.azs.map((a) => a.slice(r.name.length)).join(', ')})` : ''}
            </span>
          </li>
        ))}
        <li>
          <strong>Global</strong>
          <span>{s.global} resources</span>
        </li>
        {s.unresolved > 0 && (
          <li>
            <strong>Unresolved</strong>
            <span>{s.unresolved} resources</span>
          </li>
        )}
      </ul>
      <ul className="plan-preview__types" aria-label="Resource types">
        {s.byLabel.map((t) => (
          <li key={t.label}>
            {t.label} <span>{t.count}</span>
          </li>
        ))}
      </ul>
      {s.warnings.length > 0 && (
        <ul className="plan-preview__warnings" aria-label="Warnings">
          {s.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
