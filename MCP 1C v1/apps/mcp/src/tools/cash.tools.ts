import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CashManagementService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerCashTools(server: McpServer, svc: CashManagementService): void {
  server.tool(
    "onec_get_cash_position",
    "Returns consolidated cash and bank balances from GL accounts 1010 (cash), 1020 (cash in transit), and 1030 (bank accounts) as of a given date. Includes per-account breakdown and total KZT. This is the primary tool for 'what's our cash position?' queries. Drill: call onec_drill_cash_by_account for movement detail, or onec_get_forex_position for multi-currency breakdown.",
    {
      asOfDate: z.string().describe("Balance date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getCashPosition(asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_drill_cash_by_account",
    "Drills into a specific cash account (1010, 1020, or 1030) and returns the full account card with individual debit/credit postings for the period. Use after onec_get_cash_position to trace specific movements. Drill: call onec_get_document(recorderKey) on any row to see the source payment document.",
    {
      accountCode: z.string().regex(/^10[123]0$/).describe("Cash account: 1010, 1020, or 1030"),
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ accountCode, dateFrom, dateTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.drillCashByAccount(accountCode, dateFrom, dateTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_bank_reconciliation_detail",
    "Returns GL balance for a bank account and reconciliation status. Compares GL balance against bank statement balance and identifies outstanding items. A reconciled: false result indicates unposted transactions. Drill: call onec_drill_cash_by_account for the unreconciled period to find outstanding items.",
    {
      accountCode: z.string().describe("Bank account code, e.g. '1030'"),
      asOfDate: z.string().describe("Reconciliation date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ accountCode, asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getBankReconciliationDetail(accountCode, asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_cash_flow_analysis",
    "Returns operating cash inflows and outflows for a period by summing debit and credit turnovers on accounts 1010 and 1030. Shows net cash flow (inflows − outflows). Use for period-over-period cash trend analysis. Drill: call onec_drill_cash_by_account to break down by individual transactions.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getCashFlowAnalysis(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_payment_aging",
    "Buckets outgoing payment documents (Document_ПлатежноеПоручениеИсходящее) by age: 0-30, 31-60, 61-90, and 90+ days. Returns count and total amount per bucket. Use to identify overdue payment obligations. Drill: call onec_drill_cash_by_account('1030', ...) for the overdue bucket dates to trace specific payments.",
    {
      organizationGuid: z.string().uuid().optional(),
      asOfDate: z.string().optional().describe("Aging reference date YYYY-MM-DD (default: today)"),
    },
    async ({ organizationGuid, asOfDate }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getPaymentAging(org.guid, asOfDate);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_analyze_cash_variance",
    "Computes mean and standard deviation of cash flows for the period and flags statistical outliers (>2σ deviation). Use to detect unusual cash movements that warrant investigation. Drill: for flagged outlier dates, call onec_drill_cash_by_account to inspect individual transactions.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.analyzeCashVariance(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_forex_position",
    "Returns available exchange rates from InformationRegister_КурсыВалют as of the given date. Use to assess foreign currency exposure. Drill: for each non-KZT currency, call onec_drill_cash_by_account on the corresponding FCY bank account to see FCY-denominated movements.",
    {
      asOfDate: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getForexPosition(asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_cash_consistency",
    "Checks that no cash account (1010, 1030) has a credit balance, which would indicate a data entry error or unposted reversal. Returns passed flag and list of issues. Run at period-end close before generating financial statements. Drill: for each failing account, call onec_drill_cash_by_account to identify the erroneous posting.",
    {
      asOfDate: z.string().describe("Balance date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.validateCashConsistency(asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.issues.length });
      } catch (e) { return wrapError(e); }
    },
  );
}
