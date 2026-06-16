import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DrillDownService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerDrillDownTools(server: McpServer, drill: DrillDownService): void {

  server.tool(
    "onec_drill_account_sign",
    "Drill into a specific account that has an abnormal sign (asset with Кт balance, liability with Дт balance). Returns the individual documents that drove the wrong-side balance, with recorder GUIDs, dates, amounts, and step-by-step correction instructions in 1C. Use after onec_validate_account_signs flags an account. See kz-agro-validation-rules.md#A.1.",
    {
      accountCode:      z.string().regex(/^\d{4}(\.\d{1,4})?$/, "Account code must be 4 digits with optional sub-account (e.g. '3212', '3310.01')").describe("Account code to investigate, e.g. '3212' or '3350'"),
      dateFrom:         z.string(),
      dateTo:           z.string(),
      organizationGuid: z.string().uuid().optional(),
      limit:            z.number().int().min(1).max(100).default(20).optional()
                          .describe("Max number of offending documents to return (default 20)"),
    },
    async ({ accountCode, dateFrom, dateTo, organizationGuid, limit }) => {
      try {
        const org = resolveOrg(organizationGuid);
        return ok(await drill.drillAccountSignViolation(accountCode, dateFrom, dateTo, org.guid, limit ?? 20),
          { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_payroll_tax",
    "Per-document payroll tax check. For each НачислениеЗарплатыРаботникамОрганизаций in the period, compares actual vs expected amount on a specific tax account: ОПВ=3220, ОППВ=3250, СО=3211, ВОСМС=3213, ОСМС=3212, ИПН=3120, СН=3150. Flags documents where the rate deviates beyond tolerance, shows document number, base, expected, actual amounts, and gives 1C correction steps. Use after onec_validate_payroll_tax_rates flags a deviation. See kz-agro-validation-rules.md#A.3.",
    {
      taxAccount:       z.enum(["3220","3250","3211","3213","3212","3120","3150"])
                          .describe("Tax account to check: 3220=ОПВ, 3250=ОППВ, 3211=СО, 3213=ВОСМС, 3212=ОСМС, 3120=ИПН, 3150=СН"),
      dateFrom:         z.string(),
      dateTo:           z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ taxAccount, dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await drill.drillPayrollTaxDeviation(taxAccount, dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_missing_esf",
    "Full list of every РеализацияТоваровУслуг document that has no matching ЭСФ in InformationRegister_АктуальныеЭСФ. Returns document GUIDs, numbers, dates, amounts, VAT amounts, and per-document instructions on how to issue ЭСФ via ИС ЭСФ (esf.gov.kz). Use after onec_validate_esf_coverage flags missing ЭСФ. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom:         z.string(),
      dateTo:           z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await drill.drillMissingESF(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_stale_advances",
    "Detailed aging analysis of advances issued (1710) or advances received (3510). Lists each open advance line by contractor and contract, calculates age from contract start date, flags as stale if age exceeds agingDays (default 90). Provides specific corrective action per contractor: request delivery, demand return, or create offsetting реализация. Use after onec_validate_advance_aging or onec_validate_reconciliation finds large advance balances. See kz-agro-validation-rules.md#A.6.",
    {
      date:             z.string().describe("Balance date, e.g. '2025-12-31'"),
      accountCode:      z.enum(["1710","3510"]).describe("1710 = advances issued to suppliers; 3510 = advances received from customers"),
      organizationGuid: z.string().uuid().optional(),
      agingDays:        z.number().int().min(1).max(1825).default(90).optional()
                          .describe("Days threshold for stale advances (default 90)"),
    },
    async ({ date, accountCode, organizationGuid, agingDays }) => {
      try { return ok(await drill.drillStaleAdvances(date, accountCode, organizationGuid, agingDays ?? 90)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_vat_documents",
    "Per-sales-document НДС check. For each posted РеализацияТоваровУслуг, compares actual 3131 (НДС начисленный) posting vs expected (account 6010 net revenue × 12 %). Lists every document where VAT is missing or deviates beyond ±1 %. Returns document GUIDs, numbers, dates, revenue, expected and actual VAT, and step-by-step 1C fix instructions. Use after onec_validate_vat_charged_vs_revenue flags a mismatch. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom:         z.string(),
      dateTo:           z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await drill.drillVATDocuments(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_wip_documents",
    "Analyze account 8112 (НЗП растениеводство) for a period: shows inputs by corr-account (1310 materials, 3350 payroll, 2420 depreciation, 8412 overhead) and outputs (harvest transfers 1320). Flags if harvest oприходование (1320←8112) is missing. Use to investigate WIP closure issues found by onec_validate_wip_closure. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom:         z.string(),
      dateTo:           z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await drill.drillWIPSourceDocuments(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_unposted_documents",
    "Full list of unposted (Posted=false) documents of a specific type for a period. Returns every document with number, date, amount, GUID. Per-document instruction: how to post in 1C. Supported types: РеализацияТоваровУслуг, ПоступлениеТоваровУслуг, ПлатежноеПоручениеИсходящее, ПлатежноеПоручениеВходящее, НачислениеЗарплатыРаботникамОрганизаций, ОперацияБух. Use after onec_validate_period_close_readiness finds unposted documents. See kz-agro-validation-rules.md#A.4.",
    {
      documentType: z.enum([
        "РеализацияТоваровУслуг",
        "ПоступлениеТоваровУслуг",
        "ПлатежноеПоручениеИсходящее",
        "ПлатежноеПоручениеВходящее",
        "НачислениеЗарплатыРаботникамОрганизаций",
        "ОперацияБух",
      ]),
      dateFrom:         z.string(),
      dateTo:           z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ documentType, dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await drill.drillUnpostedDocuments(documentType, dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_unpaid_payments",
    "Full list of outgoing payment orders (ПлатежноеПоручениеИсходящее) that are posted (Posted=true) but not flagged as paid (Оплачено=false). Returns document number, date, amount, contractor name, GUID, age in days, and per-document instructions to confirm with bank and update Оплачено flag. Use after onec_validate_bank_balance_consistency finds unpaid payments. See kz-agro-validation-rules.md#A.6.",
    {
      dateFrom:         z.string(),
      dateTo:           z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await drill.drillUnpaidPayments(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );
}
