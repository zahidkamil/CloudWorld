import { create } from 'zustand';
import type { Finding } from '@/engine/security/types';
import { MAX_HINTS, pointsForCatch, WRONG_PENALTY } from '@/engine/security/scoring';

export interface AttemptResult {
  correct: boolean;
  /** Points added (positive) or taken off (negative). */
  points: number;
  explanation: string;
}

interface DefenderState {
  score: number;
  /** Finding id -> points earned for catching it. */
  caught: Record<string, number>;
  /** Finding id -> how many hints were revealed. */
  hints: Record<string, number>;
  /** Finding id -> remediation ids already tried and wrong. */
  wrong: Record<string, string[]>;
  selectedId: string | null;
  select: (id: string | null) => void;
  revealHint: (findingId: string) => void;
  /** Simulated remediation. Only Defender session state changes; the graph and Terraform never do. */
  attempt: (finding: Finding, remediationId: string) => AttemptResult | null;
  reset: () => void;
}

const empty = { score: 0, caught: {}, hints: {}, wrong: {}, selectedId: null } as const;

export const useDefender = create<DefenderState>((set, get) => ({
  ...empty,
  select: (selectedId) => set({ selectedId }),
  revealHint: (id) =>
    set((s) => {
      if (s.caught[id] !== undefined) return s;
      const used = s.hints[id] ?? 0;
      return used >= MAX_HINTS ? s : { hints: { ...s.hints, [id]: used + 1 } };
    }),
  attempt: (finding, remediationId) => {
    const s = get();
    if (s.caught[finding.id] !== undefined) return null;
    const choice = finding.remediations.find((r) => r.id === remediationId);
    if (!choice) return null;
    if (choice.correct) {
      const points = pointsForCatch(s.hints[finding.id] ?? 0);
      set({ score: s.score + points, caught: { ...s.caught, [finding.id]: points } });
      return { correct: true, points, explanation: choice.explanation };
    }
    const tried = s.wrong[finding.id] ?? [];
    if (tried.includes(remediationId)) return { correct: false, points: 0, explanation: choice.explanation };
    const penalty = Math.min(WRONG_PENALTY, s.score);
    set({ score: s.score - penalty, wrong: { ...s.wrong, [finding.id]: [...tried, remediationId] } });
    return { correct: false, points: penalty === 0 ? 0 : -penalty, explanation: choice.explanation };
  },
  reset: () => set({ ...empty }),
}));
