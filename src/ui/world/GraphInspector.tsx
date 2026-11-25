import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useSelection } from '@/app/selection';
import { useSession } from '@/app/store';
import { BUNDLED_SAMPLES } from '@/samples';
import { importPlan } from '@/engine/graph/importPlan';
import { relationshipsOf, type Relation } from '@/engine/graph/relations';
import type { CloudResource, InfrastructureGraph } from '@/engine/graph/types';
import { groupByType } from '@/engine/graph/typeGroups';
import { usePanelLayout } from './panelLayout';
import { PANEL_MIN_WIDTH, useResizableWidth } from './useResizableWidth';
import './graph-inspector.css';

type ViewMode = 'type' | 'location';
type OpenMode = 'default' | 'all' | 'none';

interface Section {
  title: string;
  items: CloudResource[];
}

function shortLocation(r: CloudResource): string {
  if (r.placement.scope === 'global') return 'Global';
  if (r.placement.scope === 'unresolved') return 'Unresolved';
  return r.placement.az ?? r.placement.region ?? '';
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

/** Temporary graph inspector. Task 3 adds selection in the 3D world; Task 4 turns this tree into the legend. */
export function GraphInspector() {
  const graph = useSession((s) => s.graph);
  const setGraph = useSession((s) => s.setGraph);
  const openImport = useSession((s) => s.openImport);
  const selectedId = useSelection((s) => s.selectedId);
  const select = useSelection((s) => s.select);
  const focusOn = useSelection((s) => s.focusOn);
  const [view, setView] = useState<ViewMode>('type');
  const [openMode, setOpenMode] = useState<{ mode: OpenMode; n: number }>({ mode: 'default', n: 0 });
  const { width, max, handleProps } = useResizableWidth('cloudworld.inspectorWidth');
  const setInspectorWidth = usePanelLayout((s) => s.setInspectorWidth);
  useEffect(() => setInspectorWidth(width), [width, setInspectorWidth]);
  const locationTree = useMemo(() => (graph ? groupByLocation(graph) : []), [graph]);
  const typeTree = useMemo(() => (graph ? groupByType(graph) : []), [graph]);
  const selected = graph?.resources.find((r) => r.id === selectedId);
  const rel = useMemo(
    () => (graph && selected ? relationshipsOf(graph, selected.id) : null),
    [graph, selected],
  );

  const loadSample = async (id: string) => {
    const sample = BUNDLED_SAMPLES.find((x) => x.id === id);
    if (!sample) return;
    const result = importPlan(await sample.load());
    if (result.ok) {
      setGraph(result.graph);
    }
  };

  const panelStyle = { '--inspector-width': `${width}px` } as CSSProperties;
  const handle = (
    <div
      className="inspector-resize"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize side panel"
      aria-valuemin={PANEL_MIN_WIDTH}
      aria-valuemax={max}
      aria-valuenow={width}
      tabIndex={0}
      title="Drag to resize. Double-click to reset."
      {...handleProps}
    />
  );

  if (!graph) {
    return (
      <aside className="graph-inspector" aria-label="Infrastructure" style={panelStyle}>
        {handle}
        <div className="graph-inspector__body">
          <h3>Infrastructure</h3>
          <p>No Terraform plan is loaded.</p>
          <div className="graph-inspector__actions">
            {BUNDLED_SAMPLES.map((sample, i) => (
              <button
                key={sample.id}
                type="button"
                className={`inspector-button${i === 0 ? ' is-primary' : ''}`}
                title={sample.description}
                onClick={() => void loadSample(sample.id)}
              >
                Load {sample.name.toLowerCase()}
              </button>
            ))}
            <button type="button" className="inspector-button" onClick={openImport}>
              Import plan
            </button>
          </div>
        </div>
      </aside>
    );
  }

  const setOpen = (mode: OpenMode) => setOpenMode((o) => ({ mode, n: o.n + 1 }));
  const switchView = (next: ViewMode) => {
    setView(next);
    setOpen('default');
  };
  const categoryOpen = openMode.mode !== 'none';
  const typeOpen = openMode.mode === 'all';
  const treeKey = `${view}-${openMode.n}`;
  const regionCount = graph.regions.length;

  return (
    <aside className="graph-inspector" aria-label="Infrastructure" style={panelStyle}>
      {handle}
      <div className="graph-inspector__body">
        <header>
          <h3>Infrastructure</h3>
          <span>
            {graph.resources.length} resources · {regionCount} {regionCount === 1 ? 'region' : 'regions'}
          </span>
          <button type="button" className="inspector-button" onClick={openImport}>
            Import plan
          </button>
        </header>

        {selected && rel ? (
          <article className="inspector-card" aria-label="Resource details">
            <button type="button" className="inspector-link" onClick={() => select(null)}>
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
            <Links title="Depends on" relations={rel.dependsOn} onSelect={focusOn} />
            <Links title="Used by" relations={rel.usedBy} onSelect={focusOn} />
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
          <>
            <div className="inspector-toolbar">
              <div className="inspector-toggle" role="group" aria-label="Group resources">
                <button
                  type="button"
                  aria-pressed={view === 'type'}
                  className={view === 'type' ? 'is-active' : ''}
                  onClick={() => switchView('type')}
                >
                  By type
                </button>
                <button
                  type="button"
                  aria-pressed={view === 'location'}
                  className={view === 'location' ? 'is-active' : ''}
                  onClick={() => switchView('location')}
                >
                  By location
                </button>
              </div>
              <div className="inspector-toggle">
                <button type="button" onClick={() => setOpen('all')}>
                  Expand all
                </button>
                <button type="button" onClick={() => setOpen('none')}>
                  Collapse all
                </button>
              </div>
            </div>

            {view === 'type' ? (
              <div className="inspector-tree" key={treeKey}>
                {typeTree.map((category) => (
                  <details key={category.category} open={categoryOpen} className="inspector-category">
                    <summary>
                      {category.label} <span className="inspector-dim">{category.count}</span>
                    </summary>
                    {category.types.map((t) => (
                      <details key={t.type} open={typeOpen} className="inspector-section">
                        <summary>
                          {t.label} <span className="inspector-dim">{t.resources.length}</span>
                        </summary>
                        <ul>
                          {t.resources.map((r) => (
                            <li key={r.id}>
                              <button type="button" className="inspector-link" onClick={() => focusOn(r.id)}>
                                {r.name}
                              </button>
                              <span>{shortLocation(r)}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </details>
                ))}
              </div>
            ) : (
              <div className="inspector-tree" key={treeKey}>
                {locationTree.map((place) => (
                  <details key={place.title} open={categoryOpen} className="inspector-category">
                    <summary>{place.title}</summary>
                    {place.sections.map((section) => (
                      <details
                        key={section.title}
                        className="inspector-section"
                        open={typeOpen || (openMode.mode === 'default' && place.sections.length <= 2)}
                      >
                        <summary>
                          {section.title} <span className="inspector-dim">{section.items.length}</span>
                        </summary>
                        <ul>
                          {section.items.map((r) => (
                            <li key={r.id}>
                              <button type="button" className="inspector-link" onClick={() => focusOn(r.id)}>
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
          </>
        )}
      </div>
    </aside>
  );
}
