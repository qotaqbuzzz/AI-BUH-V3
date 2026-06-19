import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TaxFilingService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerTaxFilingTools(server: McpServer, svc: TaxFilingService): void {
  server.tool(
    "onec_get_ipn_summary",
    "Returns IPN (individual income tax) accruals and payments from AccumulationRegister_ИПНРасчетыСБюджетом for the period. Shows totalAccrued, totalPaid, outstanding balance, and cross-validates against GL account 3110. Required before ФНО 200.00 submission. Drill: call onec_drill_payroll_by_employee to verify per-employee IPN amounts.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getIpnSummary(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_fund_remittance_status",
    "Returns status of social fund remittances (ОПВ pension contributions and СО social insurance) for the period: accrued vs. paid vs. outstanding, with due date and overdue flag. Useful for checking that mandatory payroll contributions are paid on time (КЗ deadline: 25th of following month). Drill: call onec_get_account_card('3150'/'3210') to see individual payments.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getFundRemittanceStatus(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_tax_filing_checklist",
    "Returns a structured checklist of Kazakhstan statutory tax filing deadlines for a given year: ФНО 100.00 (КПН), ФНО 300.00 (НДС), ФНО 200.00 (ИПН/СН), and monthly fund remittances (ОПВ/СО/ВОСМС). Each item shows type, description, due date, and isOverdue flag. Use for period-end readiness review.",
    {
      year: z.number().int().min(2020).max(2030).describe("Tax filing year, e.g. 2026"),
    },
    async ({ year }) => {
      try {
        const result = await svc.getTaxFilingChecklist(year);
        return ok(result, { rowCount: result.length, note: `${result.filter(r => r.isOverdue).length} просроченных деклараций` });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_fund_remittance_timeliness",
    "Validates that ОПВ and СО fund remittances were paid by the statutory deadline (25th of the month following the payroll period). Returns passed flag, list of overdue items, total overdue amount, and estimated late-payment penalty (0.25% per day). Drill: call onec_get_fund_remittance_status for the overdue period to identify specific unpaid amounts.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.validateFundRemittanceTimeliness(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );
}
