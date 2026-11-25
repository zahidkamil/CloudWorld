import { beforeEach, describe, expect, it } from 'vitest';
import multi from '@/samples/multi-region.plan.json';
import { importPlan } from '@/engine/graph/importPlan';
import { scanGraph } from '@/engine/security/scan';
import { useDefender } from './defenderStore';

const result = importPlan(JSON.stringify(multi));
if (!result.ok) throw new Error(result.error);
const finding = scanGraph(result.graph)[0]!;
const correct = finding.remediations.find((r) => r.correct)!;
const wrong = finding.remediations.find((r) => !r.correct)!;

describe('defender session', () => {
  beforeEach(() => useDefender.getState().reset());

  it('awards full points for a clean catch', () => {
    const r = useDefender.getState().attempt(finding, correct.id);
    expect(r).toMatchObject({ correct: true, points: 100 });
    expect(useDefender.getState().score).toBe(100);
    expect(useDefender.getState().caught[finding.id]).toBe(100);
  });

  it('reveals at most three hints and each one costs points', () => {
    const { revealHint, attempt } = useDefender.getState();
    for (let i = 0; i < 5; i += 1) revealHint(finding.id);
    expect(useDefender.getState().hints[finding.id]).toBe(3);
    expect(attempt(finding, correct.id)?.points).toBe(25);
  });

  it('penalises a wrong answer once, never below zero, and does not double-charge', () => {
    const { attempt } = useDefender.getState();
    expect(attempt(finding, wrong.id)).toMatchObject({ correct: false, points: 0 });
    useDefender.setState({ score: 15 });
    const other = finding.remediations.filter((r) => !r.correct)[1]!;
    expect(attempt(finding, other.id)?.points).toBe(-10);
    expect(useDefender.getState().score).toBe(5);
    expect(attempt(finding, other.id)?.points).toBe(0);
    expect(useDefender.getState().score).toBe(5);
  });

  it('ignores actions on a finding that is already caught, and unknown answers', () => {
    const { attempt, revealHint } = useDefender.getState();
    attempt(finding, correct.id);
    expect(attempt(finding, correct.id)).toBeNull();
    revealHint(finding.id);
    expect(useDefender.getState().hints[finding.id]).toBeUndefined();
    useDefender.getState().reset();
    expect(attempt(finding, 'nope')).toBeNull();
  });

  it('resets everything', () => {
    useDefender.getState().attempt(finding, correct.id);
    useDefender.getState().reset();
    expect(useDefender.getState()).toMatchObject({ score: 0, caught: {}, hints: {}, selectedId: null });
  });

  it('never changes the graph', () => {
    const before = JSON.stringify(result.graph);
    useDefender.getState().attempt(finding, correct.id);
    expect(JSON.stringify(result.graph)).toBe(before);
  });
});
