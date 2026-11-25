import { useMemo, useState } from 'react';
import { useSession } from '@/app/store';
import { scanGraph } from '@/engine/security/scan';
import { CATCH_POINTS, HINT_COST, MAX_HINTS, maxScore, pointsForCatch } from '@/engine/security/scoring';
import type { Finding } from '@/engine/security/types';
import { useDefender, type AttemptResult } from './defenderStore';
import './defender.css';

const NO_IDS: readonly string[] = [];

const SEVERITY_LABEL: Record<Finding['severity'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function FindingDetail({ finding }: { finding: Finding }) {
  const hintsUsed = useDefender((s) => s.hints[finding.id] ?? 0);
  const caughtPoints = useDefender((s) => s.caught[finding.id]);
  const triedWrong = useDefender((s) => s.wrong[finding.id] ?? NO_IDS);
  const revealHint = useDefender((s) => s.revealHint);
  const attempt = useDefender((s) => s.attempt);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const caught = caughtPoints !== undefined;
  const nextHintCost = HINT_COST;

  return (
    <section className="defender-detail" aria-label={`Finding: ${finding.title}`}>
      <h3>{finding.title}</h3>
      <p className="defender-evidence">{finding.evidence}</p>

      <div className="defender-hints">
        <h4>Hints</h4>
        {hintsUsed === 0 && !caught && (
          <p className="defender-dim">Stuck? Each hint takes {HINT_COST} points off this catch.</p>
        )}
        <ol>
          {finding.hints.slice(0, hintsUsed).map((hint, i) => (
            <li key={i}>{hint}</li>
          ))}
        </ol>
        {!caught && hintsUsed < MAX_HINTS && (
          <button type="button" className="defender-button" onClick={() => revealHint(finding.id)}>
            Show hint {hintsUsed + 1} of {MAX_HINTS} (−{nextHintCost} pts)
          </button>
        )}
      </div>

      {caught ? (
        <p className="defender-won" role="status">
          ✔ Caught! +{caughtPoints} points
        </p>
      ) : (
        <fieldset className="defender-fixes">
          <legend>Choose a fix (worth {pointsForCatch(hintsUsed)} pts)</legend>
          {finding.remediations.map((r) => {
            const tried = triedWrong.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                className={`defender-fix${tried ? ' is-wrong' : ''}`}
                disabled={tried}
                onClick={() => setResult(attempt(finding, r.id))}
              >
                {r.label}
              </button>
            );
          })}
        </fieldset>
      )}

      <p
        className={`defender-feedback${result ? (result.correct ? ' is-good' : ' is-bad') : ''}`}
        role="status"
        aria-live="polite"
      >
        {result
          ? `${result.explanation}${result.points ? ` (${result.points > 0 ? '+' : ''}${result.points} pts)` : ''}`
          : ''}
      </p>
      <p className="defender-dim">Fixes are simulated. Your Terraform and graph are never changed.</p>
    </section>
  );
}

/** The Attack Path mission panel: score, findings to catch, and hints. */
export function DefenderPanel() {
  const graph = useSession((s) => s.graph);
  const openImport = useSession((s) => s.openImport);
  const score = useDefender((s) => s.score);
  const caught = useDefender((s) => s.caught);
  const selectedId = useDefender((s) => s.selectedId);
  const select = useDefender((s) => s.select);
  const findings = useMemo(() => (graph ? scanGraph(graph) : []), [graph]);
  const caughtCount = findings.filter((f) => caught[f.id] !== undefined).length;
  const selected = findings.find((f) => f.id === selectedId);
  const total = findings.length;
  const allCaught = total > 0 && caughtCount === total;

  return (
    <aside className="defender-panel" aria-label="Attack path mission">
      <header className="defender-header">
        <span className="defender-kicker">Mission</span>
        <h2>Attack Path</h2>
      </header>

      <div className="defender-stats">
        <div className="defender-stat" aria-label={`Score ${score} points`}>
          <span className="defender-stat__label">Score</span>
          <span className="defender-stat__value">★ {score}</span>
          <span className="defender-stat__sub">of {maxScore(total)} possible</span>
        </div>
        <div className="defender-stat" aria-label={`${caughtCount} of ${total} findings caught`}>
          <span className="defender-stat__label">Findings caught</span>
          <span className="defender-stat__value">
            {caughtCount} / {total}
          </span>
          <span className="defender-stat__sub">{CATCH_POINTS} pts each</span>
        </div>
      </div>
      <div
        className="defender-progress"
        role="progressbar"
        aria-label="Findings caught"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={caughtCount}
      >
        <span style={{ width: total ? `${(caughtCount / total) * 100}%` : '0%' }} />
      </div>

      {!graph ? (
        <div className="defender-empty">
          <strong>No cloud to defend yet</strong>
          <p>Load a Terraform plan and the hunt begins.</p>
          <button type="button" className="defender-button is-primary" onClick={openImport}>
            Load a plan
          </button>
        </div>
      ) : total === 0 ? (
        <div className="defender-empty is-clear" role="status">
          <strong>No findings</strong>
          <p>Nothing to catch here. This cloud passed every check, so the castle gates are safe.</p>
        </div>
      ) : (
        <>
          {allCaught && (
            <p className="defender-won" role="status">
              🏆 Every finding caught! Final score {score} of {maxScore(total)}.
            </p>
          )}
          <ul className="defender-list" aria-label="Findings">
            {findings.map((f) => {
              const isCaught = caught[f.id] !== undefined;
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    className={`defender-finding${selectedId === f.id ? ' is-selected' : ''}${isCaught ? ' is-caught' : ''}`}
                    aria-pressed={selectedId === f.id}
                    onClick={() => select(selectedId === f.id ? null : f.id)}
                  >
                    <span className={`defender-sev sev-${f.severity}`}>{SEVERITY_LABEL[f.severity]}</span>
                    <span className="defender-finding__text">
                      <strong>{f.title}</strong>
                      <span>{f.resourceName}</span>
                    </span>
                    <span className="defender-finding__state">{isCaught ? '✔ Caught' : 'Open'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {selected ? (
            <FindingDetail key={selected.id} finding={selected} />
          ) : (
            <p className="defender-dim">Pick a finding to investigate it, ask for a hint, or choose a fix.</p>
          )}
        </>
      )}
    </aside>
  );
}
