import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TaxValidator } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerTaxValidationTools(server: McpServer, validator: TaxValidator): void {
  server.tool(
    "onec_validate_vat_charged_vs_revenue",
    "Check Σ 3131 (НДС начисленный, Кт) ≈ Σ 6010 (выручка нетто) × 12 % within ±1 %. In KZ 1C, 6010 holds net revenue and 3131 holds VAT separately — formula is × 12/100, NOT × 12/112. Flags missing VAT accruals or exempt-sale misclassification. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateVATCharged(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_vat_recoverable_vs_purchases",
    "Check 1421 (НДС к возмещению, Дт) does not exceed 12/112 of purchases (3310 Кт turnover). Flags double-posting or wrong VAT rate. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateVATRecoverable(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_esf_coverage",
    "Cross-check posted РеализацияТоваровУслуг vs InformationRegister_АктуальныеЭСФ — every sale must have a matching ЭСФ. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateESFCoverage(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_payroll_tax_rates",
    "Cross-check payroll-tax accruals against base × rate: ОПВ 10%, ОППВ 5%, СО 3.5%, ВОСМС 3%, ОСМС-раб 2%, ИПН 10% (with 14 МРП deduction), СН 9.5%−СО. Uses aggregate turnovers. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validatePayrollTaxRates(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_payroll_deductions",
    "Summarize НачислениеЗарплатыРаботникамОрганизаций and flag docs below МЗП (85 000 ₸) — possible part-time or data errors. Reports 2026 constants: МРП = 3 692 ₸, ИПН standard deduction = 14 × МРП = 51 688 ₸. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validatePayrollDeductions(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_payroll_accrual_balance",
    "Reconcile 3350 (зарплата к выплате) credit turnover with sum of НачислениеЗарплаты СуммаДокумента for the period. Mismatch indicates lost or unposted payroll. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validatePayrollAccrualBalance(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );
}
