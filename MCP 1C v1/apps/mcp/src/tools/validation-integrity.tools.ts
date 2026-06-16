import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { IntegrityValidator } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerIntegrityValidationTools(server: McpServer, validator: IntegrityValidator): void {
  server.tool(
    "onec_validate_double_entry",
    "Validate fundamental double-entry invariants: trial-balance totals (Σ Дт = Σ Кт for opening/turnover/closing) and optionally per-document. See kz-agro-validation-rules.md#A.1.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
      perDocumentSampleLimit: z.number().int().min(0).max(100).optional().default(0).describe("0 = trial-balance only; >0 = also check N sample documents (expensive)"),
    },
    async ({ dateFrom, dateTo, organizationGuid, perDocumentSampleLimit }) => {
      try { return ok(await validator.validateDoubleEntry(dateFrom, dateTo, organizationGuid, perDocumentSampleLimit)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_account_signs",
    "Flag atypical balances: credit balance on asset accounts, debit balance on liability accounts, and negative (red-storno) turnovers. Excludes known contra-accounts. See kz-agro-validation-rules.md#A.1.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateAccountSigns(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_balance_arithmetic",
    "Per-account arithmetic check: opening + turnover_Дт − turnover_Кт = closing. Failures indicate register corruption or unposted period transition. See kz-agro-validation-rules.md#A.1.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateBalanceArithmetic(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_extdimension",
    "Check that accounts requiring sub-accounts (contractor / employee / nomenclature) actually have ExtDimension1 set. Flags orphan postings without proper analytics. See kz-agro-validation-rules.md#A.1.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD (used for period context only — check is at closing date)"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateExtDimensions(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );
}
