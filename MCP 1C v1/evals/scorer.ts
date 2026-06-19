import type { ComposedAnswer } from "../apps/mcp/src/composer/ProvenanceRecord.js";

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

export function score(
  q: EvalQuestion,
  rawResult: string,
  durationMs: number,
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

  // Check for MCP-level error response
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

  switch (q.expected.type) {
    case "no_error":
      return { ...base, verdict: "pass", reason: "Tool responded without error" };

    case "returns_value": {
      if (base.valuesReturned === 0) {
        const isUnknown = answer.answer?.includes("не распознан") || answer.answer?.includes("unknown intent");
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
