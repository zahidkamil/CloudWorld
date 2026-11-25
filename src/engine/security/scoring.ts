/** Points for catching one finding with no hints. */
export const CATCH_POINTS = 100;
/** Each revealed hint takes this many points off the catch. */
export const HINT_COST = 25;
/** The least a catch is worth, however many hints were used. */
export const MIN_CATCH_POINTS = 25;
/** A wrong remediation costs this much. The score never drops below zero. */
export const WRONG_PENALTY = 10;
export const MAX_HINTS = 3;

export function pointsForCatch(hintsUsed: number): number {
  const hints = Math.min(Math.max(hintsUsed, 0), MAX_HINTS);
  return Math.max(MIN_CATCH_POINTS, CATCH_POINTS - HINT_COST * hints);
}

export const maxScore = (findingCount: number): number => findingCount * CATCH_POINTS;
