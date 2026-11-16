import { useMemo, useState } from 'react';
import { useSession } from '@/app/store';
import { BUNDLED_SAMPLES } from '@/samples';
import { importPlan } from '@/engine/graph/importPlan';
import { relationshipsOf, type Relation } from '@/engine/graph/relations';
import type { CloudResource, InfrastructureGraph } from '@/engine/graph/types';
import './graph-inspector.css';

interface Section {
  title: string;
  items: CloudResource[];
}

function groupByLocation(graph: InfrastructureGraph): { title: string; sections: Section[] }[] {
  const out: { title: string; sections: Section[] }[] = [];
  const global = graph.resources.filter((r) => r.placement.scope === 'global');
  if (global.length) out.push({ title: 'Global', sections: [{ title: 'Account-wide', items: global }] });
  for (const region of graph.regions) {
    const inRegion = graph.resources.filter((r) => r.placement.region === region.name);
    const sections: Section[] = [];
    const regionLevel = inRegion.filter((r) => r.placement.scope === 'region');
    if (regionLevel.length) sections.push({ title: 'Region level', items: regionLevel });
    for (const az of region.azs) {
      const items = inRegion.filter((r) => r.placement.scope === 'az' && r.placement.az === az);
      if (items.length) sections.push({ title: az, items });
    }
    out.push({ title: region.name, sections });
  }
  const unresolved = graph.resources.filter((r) => r.placement.scope === 'unresolved');
  if (unresolved.length)
    out.push({ title: 'Unresolved', sections: [{ title: 'No region found', items: unresolved }] });
  return out;
}

function Links({
  title,
  relations,
  onSelect,
}: {
  title: string;
  relations: Relation[];
  onSelect: (id: string) => void;
}) {
  if (relations.length === 0) return null;
  return (
    <section>
      <h4>{title}</h4>
      <ul>
        {relations.map((r) => (
          <li key={`${r.resource.id}|${r.kind}|${r.via}`}>
            <button type="button" className="inspector-link" onClick={() => onSelect(r.resource.id)}>
              {r.resource.name}
            </button>
            <span>
              {r.resource.label}
              {r.via ? ` · ${r.via}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Temporary graph inspector. Task 3 replaces it with selection in the 3D world. */
export function GraphInspector() {
  const graph = useSession((s) => s.graph);
  const setGraph = useSession((s) => s.setGraph);
  const openImport = useSession((s) => s.openImport);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tree = useMemo(() => (graph ? groupByLocation(graph) : []), [graph]);
  const selected = graph?.resources.find((r) => r.id === selectedId);
  const rel = useMemo(
    () => (graph && selected ? relationshipsOf(graph, selected.id) : null),
    [graph, selected],
  );

  const loadSample = async () => {
    const sample = BUNDLED_SAMPLES[0];
    if (!sample) return;
    const result = importPlan(await sample.load());
    if (result.ok) setGraph(result.graph);
  };

  if (!graph) {
    return (
      <aside className="graph-inspector" aria-label="Infrastructure">
        <h3>Infrastructure</h3>
        <p>No Terraform plan is loaded.</p>
        <div className="graph-inspector__actions">
          <button type="button" className="inspector-button is-primary" onClick={() => void loadSample()}>
            Load sample
          </button>
          <button type="button" className="inspector-button" onClick={openImport}>
            Import plan
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="graph-inspector" aria-label="Infrastructure">
      <header>
        <h3>Infrastructure</h3>
        <span>
          {graph.resources.length} resources · {graph.regions.length} regions
        </span>
        <button type="button" className="inspector-button" onClick={openImport}>
          Import plan
        </button>
      </header>

      {selected && rel ? (
        <article className="inspector-card" aria-label="Resource details">
          <button type="button" className="inspector-link" onClick={() => setSelectedId(null)}>
            ← All resources
          </button>
          <h4>{selected.name}</h4>
          <dl>
            <dt>Type</dt>
            <dd>
              {selected.label} <code>{selected.type}</code>
            </dd>
            <dt>Address</dt>
            <dd>
              <code>{selected.id}</code>
            </dd>
            <dt>Location</dt>
            <dd>
              {selected.placement.scope === 'global'
                ? 'Global'
                : selected.placement.scope === 'unresolved'
                  ? 'Unresolved'
                  : [selected.placement.region, selected.placement.az].filter(Boolean).join(' · ')}{' '}
              <span className="inspector-dim">({selected.placement.source})</span>
              {selected.placement.azs && selected.placement.scope === 'region' && (
                <div className="inspector-dim">Spans {selected.placement.azs.join(', ')}</div>
              )}
            </dd>
            {Object.entries(selected.attributes).map(([k, v]) => (
              <div key={k} className="inspector-attr">
                <dt>{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
          </dl>
          <Links title="Depends on" relations={rel.dependsOn} onSelect={setSelectedId} />
          <Links title="Used by" relations={rel.usedBy} onSelect={setSelectedId} />
          {rel.variables.length > 0 && (
            <section>
              <h4>Variables</h4>
              <p className="inspector-dim">{rel.variables.join(', ')}</p>
            </section>
          )}
          {rel.peers.map((p) => (
            <section key={p.groupId}>
              <h4>Shares {p.kind.replace('-', ' ')}</h4>
              <p className="inspector-dim">
                <code>{p.groupId}</code> with {p.others.length} other{p.others.length === 1 ? '' : 's'}
              </p>
            </section>
          ))}
        </article>
      ) : (
        <div className="inspector-tree">
          {tree.map((place) => (
            <details key={place.title} open={tree.length <= 3}>
              <summary>{place.title}</summary>
              {place.sections.map((section) => (
                <details key={section.title} className="inspector-section" open={place.sections.length <= 2}>
                  <summary>
                    {section.title} <span className="inspector-dim">{section.items.length}</span>
                  </summary>
                  <ul>
                    {section.items.map((r) => (
                      <li key={r.id}>
                        <button type="button" className="inspector-link" onClick={() => setSelectedId(r.id)}>
                          {r.name}
                        </button>
                        <span>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </details>
          ))}
        </div>
      )}
    </aside>
  );
}
