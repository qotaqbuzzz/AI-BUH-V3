import type { ComposedAnswer, ProvenanceRecord } from "../apps/mcp/src/composer/ProvenanceRecord.js";

export interface EvalQuestion {
  id: string;
  domain: string;
  question_ru: string;
  question_en?: string;
  as_of_date?: string;
  contractor_hint?: string;
  expected: {
    type: "returns_value" | "no_error" | "amount";
    currency?: string;
    value?: number;
    tolerance_pct?: number;
  };
  must_call?: string[];
  must_cite_source?: boolean;
  note?: string;
}

export type Verdict = "pass" | "fail" | "skip" | "needs_review";

export interface ScoreResult {
  id: string;
  domain: string;
  question: string;
  verdict: Verdict;
  reason: string;
  durationMs: number;
  trailLength: number;
  valuesReturned: number;
  note?: string;
}

/**
 * Domains with a live AnswerComposer pattern.
 * no_error verdicts for other domains are downgraded to needs_review until patterns land.
 */
const IMPLEMENTED_DOMAINS = new Set(["receivables", "payables", "cash"]);

/**
 * @param q           Eval question definition
 * @param rawResult   Raw text from the MCP tool (expected to be ComposedAnswer JSON)
 * @param durationMs  Wall-clock time for the call
 * @param toolsCalled MCP tool names the agent actually called (agent mode only).
 *                    When provided, must_call is enforced against this list (all domains).
 *                    When absent (direct mode), must_call is enforced against trail toolNames
 *                    for IMPLEMENTED_DOMAINS only.
 */
export function score(
  q: EvalQuestion,
  rawResult: string,
  durationMs: number,
  toolsCalled?: string[],
): ScoreResult {
  const base = {
    id: q.id,
    domain: q.domain,
    question: q.question_ru,
    durationMs,
    trailLength: 0,
    valuesReturned: 0,
    note: q.note,
  };

  let answer: ComposedAnswer | null = null;
  try {
    answer = JSON.parse(rawResult) as ComposedAnswer;
  } catch {
    return { ...base, verdict: "fail", reason: "Response is not valid JSON" };
  }

  // MCP-level error response
  if ((answer as unknown as { isError?: boolean }).isError) {
    const errText = (answer as unknown as { content?: Array<{ text: string }> })
      .content?.[0]?.text ?? "unknown";
    return { ...base, verdict: "fail", reason: `MCP error: ${errText}` };
  }

  base.trailLength = answer.trail?.length ?? 0;
  base.valuesReturned = answer.values?.length ?? 0;

  if (q.must_cite_source && base.trailLength === 0) {
    return { ...base, verdict: "fail", reason: "Expected provenance trail but trail is empty" };
  }

  // ── must_call enforcement ──────────────────────────────────────────────────

  // Agent mode: verify agent called the declared tools (enforced for all domains).
  if (q.must_call?.length && toolsCalled !== undefined) {
    const missing = q.must_call.filter((t) => !toolsCalled.includes(t));
    if (missing.length > 0) {
      return {
        ...base,
        verdict: "fail",
        reason: `agent must_call not satisfied: ${missing.join(", ")} (called: ${toolsCalled.join(", ") || "none"})`,
      };
    }
  }

  // Direct mode: verify declared tools appear in provenance trail.
  // Only for IMPLEMENTED_DOMAINS — other domains get no_error→needs_review below.
  if (q.must_call?.length && toolsCalled === undefined && IMPLEMENTED_DOMAINS.has(q.domain)) {
    const trailTools = new Set(
      (answer.trail ?? [])
        .filter((t): t is ProvenanceRecord => "toolName" in t)
        .map((t) => t.toolName),
    );
    const missing = q.must_call.filter((t) => !trailTools.has(t));
    if (missing.length > 0) {
      return {
        ...base,
        verdict: "fail",
        reason: `must_call not in trail: ${missing.join(", ")} (trail has: ${[...trailTools].join(", ") || "none"})`,
      };
    }
  }

  // ── expected type switch ───────────────────────────────────────────────────

  switch (q.expected.type) {
    case "no_error": {
      // Domains without an AnswerComposer pattern yet → needs_review, not a phantom pass.
      if (!IMPLEMENTED_DOMAINS.has(q.domain)) {
        return {
          ...base,
          verdict: "needs_review",
          reason: `Domain '${q.domain}' has no AnswerComposer pattern yet`,
        };
      }
      // Even within implemented domains, "unknown intent" means the question slipped through.
      if (answer.answer?.includes("unknown intent")) {
        return { ...base, verdict: "needs_review", reason: "AnswerComposer: unknown intent" };
      }
      return { ...base, verdict: "pass", reason: "Tool responded without error" };
    }

    case "returns_value": {
      if (base.valuesReturned === 0) {
        const isUnknown = answer.answer?.includes("unknown intent");
        if (isUnknown) {
          return { ...base, verdict: "needs_review", reason: "AnswerComposer: unknown intent — add pattern" };
        }
        return { ...base, verdict: "fail", reason: "No values in response" };
      }
      const val = answer.values[0].amount;
      if (val <= 0) {
        return { ...base, verdict: "needs_review", reason: `Value is zero or negative: ${val}` };
      }
      return {
        ...base,
        verdict: "pass",
        reason: `${val.toLocaleString("ru-KZ")} ${answer.values[0].currency}`,
      };
    }

    case "amount": {
      const expected = q.expected.value!;
      const tol = (q.expected.tolerance_pct ?? 1) / 100;
      if (base.valuesReturned === 0) {
        return { ...base, verdict: "fail", reason: "No value returned" };
      }
      const actual = answer.values[0].amount;
      const delta = Math.abs(actual - expected) / Math.max(expected, 1);
      if (delta <= tol) {
        return {
          ...base,
          verdict: "pass",
          reason: `${actual.toLocaleString("ru-KZ")} ≈ ${expected.toLocaleString("ru-KZ")} (Δ${(delta * 100).toFixed(2)}%)`,
        };
      }
      return {
        ...base,
        verdict: "fail",
        reason: `Got ${actual.toLocaleString("ru-KZ")}, expected ${expected.toLocaleString("ru-KZ")} (Δ${(delta * 100).toFixed(2)}% > tol ${(tol * 100).toFixed(1)}%)`,
      };
    }

    default:
      return { ...base, verdict: "skip", reason: `Unknown expected.type: ${(q.expected as { type: string }).type}` };
  }
}
