import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/app/store';
import { importPlan } from '@/engine/graph/importPlan';
import type { InfrastructureGraph } from '@/engine/graph/types';
import { MAX_PLAN_BYTES } from '@/engine/terraform/types';
import { BUNDLED_SAMPLES } from '@/samples';
import { PlanPreview } from './PlanPreview';
import './import.css';

type Draft = { source: string; graph: InfrastructureGraph };

/**
 * Sample / upload / paste, then a preview, then an explicit "Load world".
 * Cancelling or failing never touches the current graph (R1.5). Raw text stays in component state only.
 */
export function ImportDialog() {
  const setGraph = useSession((s) => s.setGraph);
  const close = useSession((s) => s.closeImport);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pasted, setPasted] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLElement>('button, textarea, input')?.focus();
    // Safari does not focus buttons on click, so Escape is handled at the document level.
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('keydown', onEscape);
      previous?.focus();
    };
  }, [close]);

  const preview = (source: string, text: string) => {
    const result = importPlan(text);
    if (result.ok) {
      setDraft({ source, graph: result.graph });
      setError(null);
    } else {
      setDraft(null);
      setError(result.error);
    }
  };

  const loadSample = async (id: string) => {
    const sample = BUNDLED_SAMPLES.find((x) => x.id === id);
    if (!sample) return;
    setBusy(true);
    try {
      preview(sample.name, await sample.load());
    } finally {
      setBusy(false);
    }
  };

  const loadFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_PLAN_BYTES) {
      setDraft(null);
      setError('This file is larger than 15 MB. Trim the plan or split it by workspace.');
      return;
    }
    setBusy(true);
    try {
      preview(file.name, await file.text());
    } catch {
      setDraft(null);
      setError('That file could not be read.');
    } finally {
      setBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const items = [
      ...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), textarea, input'),
    ];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  return (
    <div className="import-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        ref={dialogRef}
        className="import-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        onKeyDown={onKeyDown}
      >
        <header className="import-dialog__header">
          <h2 id="import-title">Load infrastructure</h2>
          <button type="button" className="import-close" onClick={close} aria-label="Close">
            ×
          </button>
        </header>
        <p className="import-dialog__hint">
          Plans are read in your browser and never uploaded. You only need <code>plan</code> and{' '}
          <code>show</code>. Never <code>apply</code>.
        </p>
        <details className="import-help">
          <summary>How do I get a plan file?</summary>
          <pre>
            {`terraform init
terraform plan -out=plan.tfplan
terraform show -json plan.tfplan > plan.json`}
          </pre>
          <p>Then upload or paste plan.json. It can contain secrets, so do not share it.</p>
        </details>

        {draft ? (
          <>
            <p className="import-dialog__source">
              Ready to load <strong>{draft.source}</strong>
            </p>
            <PlanPreview graph={draft.graph} />
            <footer className="import-dialog__actions">
              <button type="button" className="import-button" onClick={() => setDraft(null)}>
                Back
              </button>
              <button type="button" className="import-button" onClick={close}>
                Cancel
              </button>
              <button
                type="button"
                className="import-button is-primary"
                onClick={() => setGraph(draft.graph)}
              >
                Load world
              </button>
            </footer>
          </>
        ) : (
          <div className="import-sources">
            <section aria-labelledby="src-sample">
              <h3 id="src-sample">Bundled sample</h3>
              {BUNDLED_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="import-sample"
                  disabled={busy}
                  onClick={() => void loadSample(s.id)}
                >
                  <strong>{s.name}</strong>
                  <span>{s.description}</span>
                </button>
              ))}
            </section>
            <section aria-labelledby="src-file">
              <h3 id="src-file">Upload a plan file</h3>
              <input
                type="file"
                accept=".json,application/json"
                aria-label="Plan JSON file"
                disabled={busy}
                onChange={(e) => {
                  void loadFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </section>
            <section aria-labelledby="src-paste">
              <h3 id="src-paste">Paste plan JSON</h3>
              <textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                rows={5}
                spellCheck={false}
                aria-label="Plan JSON"
                placeholder='{"format_version": "1.2", ...}'
              />
              <button
                type="button"
                className="import-button"
                disabled={busy || pasted.trim() === ''}
                onClick={() => preview('Pasted plan', pasted)}
              >
                Preview
              </button>
            </section>
            {error && (
              <p className="import-error" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
