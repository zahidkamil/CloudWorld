export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Remediation {
  id: string;
  label: string;
  correct: boolean;
  /** Shown after the player picks it. */
  explanation: string;
}

/** A security issue found in the graph. Pure data: nothing here changes the graph or Terraform. */
export interface Finding {
  /** Stable: `<ruleId>:<resourceId>:<detail>`. */
  id: string;
  ruleId: string;
  severity: Severity;
  title: string;
  resourceId: string;
  resourceName: string;
  /** What was found, in plain words. Contains no secrets or raw plan values. */
  evidence: string;
  /** Three nudges from gentle to almost-the-answer. */
  hints: readonly [string, string, string];
  /** Simulated fixes. At least one is correct. The graph is never edited. */
  remediations: readonly Remediation[];
}
