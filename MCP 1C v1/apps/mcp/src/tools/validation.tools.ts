import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { IntegrityValidator, TaxValidator, PeriodCloseValidator, DocumentValidator, ReconciliationValidator } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

const ruleIdEnum = z.enum([
  // Integrity rules
  "double-entry",
  "account-signs",
  "balance-arithmetic",
  "extdimension",
  // Tax rules
  "vat-charged",
  "vat-recoverable",
  "esf-coverage",
  "payroll-tax-rates",
  "payroll-deductions",
  "payroll-accrual-balance",
  // Period-close rules
  "period-close-readiness",
  "accrual-alignment",
  "depreciation-completeness",
  "wip-closure",
  "cogs-basis",
  // Reconciliation rules
  "invoice-payment-matching",
  "contract-terms-compliance",
  "bank-balance-consistency",
  // Document rules
  "line-totals",
  "nomenclature-accounts",
  "advance-aging",
]);

type RuleId = z.infer<typeof ruleIdEnum>;

const ruleDescriptions: Record<RuleId, string> = {
  "double-entry": "Σ Дт = Σ Кт for opening/turnover/closing (optionally per-document)",
  "account-signs": "Asset accounts must have Дт balance, liabilities must have Кт (flags red-storno)",
  "balance-arithmetic": "opening + turnoverДт − turnoverКт = closing, per account",
  "extdimension": "Accounts requiring sub-accounts (contractor/employee) must have ExtDimension1 set",
  "vat-charged": "Σ 3131 (НДС Кт) ≈ Σ 6010 (revenue) × 12% within ±1%",
  "vat-recoverable": "1421 (НДС Дт) ≤ 3310 (purchases Кт) × 12/112",
  "esf-coverage": "Every РеализацияТоваровУслуг has matching ЭСФ in info register",
  "payroll-tax-rates": "ОПВ 10%, ОППВ 5%, СО 3.5%, ВОСМС 3%, ОСМС 2%, ИПН 10%, СН 9.5%−СО",
  "payroll-deductions": "Flag НачислениеЗарплаты below МЗП (85,000 ₸)",
  "payroll-accrual-balance": "3350 (Кт) turnover ≈ Σ НачислениеЗарплаты document amounts",
  "period-close-readiness": "Pre-flight: unposted docs, depreciation presence, ЗакрытиеМесяца status",
  "accrual-alignment": "Revenue requires VAT; salary requires ОПВ (proportional)",
  "depreciation-completeness": "If 2410 > 0, then 2420 must have credit turnover",
  "wip-closure": "Seasonal 8110/8112: 0 winter, growing spring, closes to 1320 harvest, 0 after",
  "cogs-basis": "7010 (Дт) ≈ 1320 (Кт) for period",
  "invoice-payment-matching": "Outstanding A/R (1210) and A/P (3310) with top-5 contractors",
  "contract-terms-compliance": "List expired contracts (СрокДействияПо < period end)",
  "bank-balance-consistency": "1030 ≥ 0; flag outgoing payments Posted=true but Оплачено=false",
  "line-totals": "Per-line (qty × price = amount) and per-document sum check on Реализация/Поступление",
  "nomenclature-accounts": "Nomenclature type matches account (1320 = finished products only, not services)",
  "advance-aging": "Flag large outstanding advances on 1710 (paid) and 3510 (received)",
};

export function registerValidationTools(
  server: McpServer,
  integrityValidator: IntegrityValidator,
  taxValidator: TaxValidator,
  periodCloseValidator: PeriodCloseValidator,
  documentValidator: DocumentValidator,
  reconciliationValidator: ReconciliationValidator,
): void {
  server.tool(
    "onec_validate",
    [
      "Universal validation interface. Specify ruleId to check:",
      Object.entries(ruleDescriptions)
        .map(([id, desc]) => `  • ${id}: ${desc}`)
        .join("\n"),
    ].join("\n"),
    {
      ruleId: ruleIdEnum.describe("Validation rule to execute"),
      dateFrom: z.string().optional().describe("Start date YYYY-MM-DD (required for date-range rules)"),
      dateTo: z.string().optional().describe("End date YYYY-MM-DD (required for date-range rules)"),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (for balance-based rules)"),
      year: z.number().int().min(2020).max(2030).optional().describe("Year for period-close rules"),
      month: z.number().int().min(1).max(12).optional().describe("Month for period-close rules"),
      organizationGuid: z.string().uuid().optional().describe("Filter by organization Ref_Key"),
      accountCode: z.string().optional().describe("Account code for account-specific rules"),
      documentType: z.enum(["РеализацияТоваровУслуг", "ПоступлениеТоваровУслуг"]).optional(),
      // Optional parameters
      perDocumentSampleLimit: z.number().int().min(0).max(100).optional().default(0),
      sampleLimit: z.number().int().min(1).max(500).optional().default(50),
      agingDaysWarn: z.number().int().min(30).max(365).optional().default(60),
      agingDays: z.number().int().min(30).max(365).optional().default(90),
    },
    async (params) => {
      try {
        const {
          ruleId,
          dateFrom,
          dateTo,
          date,
          year,
          month,
          organizationGuid,
          accountCode,
          documentType,
          perDocumentSampleLimit,
          sampleLimit,
          agingDaysWarn,
          agingDays,
        } = params;

        let result: unknown;

        switch (ruleId) {
          // Integrity rules
          case "double-entry":
            if (!dateFrom || !dateTo) throw new Error("double-entry requires dateFrom and dateTo");
            result = await integrityValidator.validateDoubleEntry(dateFrom, dateTo, organizationGuid, perDocumentSampleLimit ?? 0);
            break;
          case "account-signs":
            if (!dateFrom || !dateTo) throw new Error("account-signs requires dateFrom and dateTo");
            result = await integrityValidator.validateAccountSigns(dateFrom, dateTo, organizationGuid);
            break;
          case "balance-arithmetic":
            if (!dateFrom || !dateTo) throw new Error("balance-arithmetic requires dateFrom and dateTo");
            result = await integrityValidator.validateBalanceArithmetic(dateFrom, dateTo, organizationGuid);
            break;
          case "extdimension":
            if (!dateFrom || !dateTo) throw new Error("extdimension requires dateFrom and dateTo");
            result = await integrityValidator.validateExtDimensions(dateFrom, dateTo, organizationGuid);
            break;

          // Tax rules
          case "vat-charged":
            if (!dateFrom || !dateTo) throw new Error("vat-charged requires dateFrom and dateTo");
            result = await taxValidator.validateVATCharged(dateFrom, dateTo, organizationGuid);
            break;
          case "vat-recoverable":
            if (!dateFrom || !dateTo) throw new Error("vat-recoverable requires dateFrom and dateTo");
            result = await taxValidator.validateVATRecoverable(dateFrom, dateTo, organizationGuid);
            break;
          case "esf-coverage":
            if (!dateFrom || !dateTo) throw new Error("esf-coverage requires dateFrom and dateTo");
            result = await taxValidator.validateESFCoverage(dateFrom, dateTo, organizationGuid);
            break;
          case "payroll-tax-rates":
            if (!dateFrom || !dateTo) throw new Error("payroll-tax-rates requires dateFrom and dateTo");
            result = await taxValidator.validatePayrollTaxRates(dateFrom, dateTo, organizationGuid);
            break;
          case "payroll-deductions":
            if (!dateFrom || !dateTo) throw new Error("payroll-deductions requires dateFrom and dateTo");
            result = await taxValidator.validatePayrollDeductions(dateFrom, dateTo, organizationGuid);
            break;
          case "payroll-accrual-balance":
            if (!dateFrom || !dateTo) throw new Error("payroll-accrual-balance requires dateFrom and dateTo");
            result = await taxValidator.validatePayrollAccrualBalance(dateFrom, dateTo, organizationGuid);
            break;

          // Period-close rules
          case "period-close-readiness":
            if (year === undefined || month === undefined) throw new Error("period-close-readiness requires year and month");
            result = await periodCloseValidator.validatePeriodCloseReadiness(year, month, organizationGuid);
            break;
          case "accrual-alignment":
            if (!dateFrom || !dateTo) throw new Error("accrual-alignment requires dateFrom and dateTo");
            result = await periodCloseValidator.validateAccrualAlignment(dateFrom, dateTo, organizationGuid);
            break;
          case "depreciation-completeness":
            if (!dateFrom || !dateTo) throw new Error("depreciation-completeness requires dateFrom and dateTo");
            result = await periodCloseValidator.validateDepreciationCompleteness(dateFrom, dateTo, organizationGuid);
            break;
          case "wip-closure":
            if (year === undefined || month === undefined) throw new Error("wip-closure requires year and month");
            result = await periodCloseValidator.validateWIPClosure(year, month, organizationGuid);
            break;
          case "cogs-basis":
            if (!dateFrom || !dateTo) throw new Error("cogs-basis requires dateFrom and dateTo");
            result = await periodCloseValidator.validateCOGSBasis(dateFrom, dateTo, organizationGuid);
            break;

          // Reconciliation rules
          case "invoice-payment-matching":
            if (!date) throw new Error("invoice-payment-matching requires date");
            result = await reconciliationValidator.validateInvoicePaymentMatching(date, organizationGuid, agingDaysWarn ?? 60);
            break;
          case "contract-terms-compliance":
            if (!dateFrom || !dateTo) throw new Error("contract-terms-compliance requires dateFrom and dateTo");
            result = await reconciliationValidator.validateContractTermsCompliance(dateFrom, dateTo, organizationGuid);
            break;
          case "bank-balance-consistency":
            if (!dateFrom || !dateTo) throw new Error("bank-balance-consistency requires dateFrom and dateTo");
            result = await reconciliationValidator.validateBankBalanceConsistency(dateFrom, dateTo, organizationGuid);
            break;

          // Document rules
          case "line-totals":
            if (!documentType) throw new Error("line-totals requires documentType");
            if (!dateFrom || !dateTo) throw new Error("line-totals requires dateFrom and dateTo");
            result = await documentValidator.validateLineTotals(documentType, dateFrom, dateTo, organizationGuid, sampleLimit ?? 50);
            break;
          case "nomenclature-accounts":
            if (!date) throw new Error("nomenclature-accounts requires date");
            result = await documentValidator.validateNomenclatureAccounts(date, organizationGuid);
            break;
          case "advance-aging":
            if (!date) throw new Error("advance-aging requires date");
            result = await documentValidator.validateAdvanceAging(date, organizationGuid, agingDays ?? 90);
            break;

          default:
            throw new Error(`Unknown rule: ${ruleId}`);
        }

        return ok(result, { orgGuid: organizationGuid });
      } catch (e) {
        return wrapError(e);
      }
    },
  );
}
