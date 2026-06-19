export type ToolTier = "primary" | "primitive" | "internal";

// Entry-points: fast-path composer + discovery + domain knowledge
const PRIMARY = new Set([
  "onec_answer",
  "onec_find_tool",
  "onec_skill_lookup",
]);

// Building blocks R1 chains when onec_answer doesn't cover the question
const PRIMITIVE = new Set([
  "onec_get_organizations",
  "onec_search_contractors",
  "onec_get_contractor",
  "onec_get_contractor_settlements",
  "onec_get_report",
  "onec_get_cash_position",
  "onec_get_account_breakdown",
  "onec_analyze_account",
  "onec_get_payroll_summary",
  "onec_get_vat_register",
  "onec_get_esf_status",
  "onec_get_document",
  "onec_resolve_guid",
  "onec_get_exchange_rates",
  "onec_get_financial_summary",
  "onec_get_month_close_status",
  "onec_drill_cash_by_account",
]);

export function tier(toolName: string): ToolTier {
  if (PRIMARY.has(toolName)) return "primary";
  if (PRIMITIVE.has(toolName)) return "primitive";
  return "internal";
}

export function isVisibleToAgent(toolName: string): boolean {
  return PRIMARY.has(toolName) || PRIMITIVE.has(toolName);
}
