/** Per-tool-call record attached to every onec_answer response. */
export interface ProvenanceRecord {
  toolName: string;
  /** OData entity set or endpoint path hit (sans credentials). Full URL hook added in Phase 2. */
  odataUrl: string;
  /** ISO8601 timestamp when the request completed (server clock). */
  asOf: string;
  orgGuid: string;
  rowCount: number;
  durationMs: number;
  cacheHit: boolean;
}

/** One reasoning step captured from R1's chain-of-thought (Phase 3). */
export interface ReasoningStep {
  kind: "reasoning";
  step: number;
  summary: string;
  tokensUsed: number;
}

export type TrailEntry = ProvenanceRecord | ReasoningStep;

export interface ValueEntry {
  label: string;
  amount: number;
  currency: string;
  asOf: string;
  source: string;
}

export interface ConflictReport {
  subject: string;
  sources: Array<{ tool: string; amount: number; asOf: string }>;
  delta_pct: number;
  hypothesis: string;
}

export interface ComposedAnswer {
  answer: string;
  values: ValueEntry[];
  trail: TrailEntry[];
  conflicts: ConflictReport[];
  followups: string[];
}

export interface AnswerContext {
  subject?: { type: "contractor" | "employee" | "asset" | "doc"; guid: string; name: string };
  period?: { start: string; end: string };
}
