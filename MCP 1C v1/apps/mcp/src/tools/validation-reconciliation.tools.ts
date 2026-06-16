import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ReconciliationValidator } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerReconciliationValidationTools(server: McpServer, validator: ReconciliationValidator): void {
  server.tool(
    "onec_validate_invoice_payment_matching",
    "Summarize outstanding A/R (1210) and A/P (3310) with top-5 contractors per side. Highlights large totals for collection/payment follow-up. See kz-agro-validation-rules.md#A.6.",
    {
      date: z.string().describe("YYYY-MM-DD — balance date"),
      organizationGuid: z.string().uuid().optional(),
      agingDaysWarn: z.number().int().min(30).max(365).optional().default(60),
    },
    async ({ date, organizationGuid, agingDaysWarn }) => {
      try { return ok(await validator.validateInvoicePaymentMatching(date, organizationGuid, agingDaysWarn)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_contract_terms_compliance",
    "List expired contracts (СрокДействияПо < period end). Contracts past their validity should be renewed or marked inactive. See kz-agro-validation-rules.md#A.6.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateContractTermsCompliance(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_bank_balance_consistency",
    "Bank account 1030: closing balance ≥ 0 check + posted-but-unpaid outgoing payments (Posted=true, Оплачено=false). See kz-agro-validation-rules.md#A.6.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateBankBalanceConsistency(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );
}
