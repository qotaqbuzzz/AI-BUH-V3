import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ReportsService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";



export function registerReportsTools(server: McpServer, reports: ReportsService): void {
  server.tool(
    "onec_get_osv",
    "Get full ОСВ (оборотно-сальдовая ведомость / trial balance) for a period from AccountingRegister_Типовой/BalanceAndTurnovers. Returns opening/closing balances and turnovers grouped by account code, plus column totals.",
    {
      dateFrom: z.string().describe("Start date YYYY-MM-DD"),
      dateTo: z.string().describe("End date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional().describe("Filter by organization Ref_Key"),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getOSV(dateFrom, dateTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_all_debtors",
    "Get all accounts receivable and advances paid: accounts 1210, 1250, 1251, 1254, 1255. Returns rows per contractor with balances and a total. Includes breakdown by account.",
    {
      organizationGuid: z.string().uuid().optional(),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (omit for current balance)"),
    },
    async ({ organizationGuid, date }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getAllDebtors(org.guid, date);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_all_creditors",
    "Get all accounts payable: accounts 3310 (suppliers), 3350 (payroll), 3387, 3390. Returns rows per contractor with balances and a total. Includes breakdown by account.",
    {
      organizationGuid: z.string().uuid().optional(),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (omit for current balance)"),
    },
    async ({ organizationGuid, date }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getAllCreditors(org.guid, date);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_contractor_balance",
    "Get complete balance picture for a contractor across ALL accounting accounts. Shows every account where the contractor appears as a dimension (ExtDimension): receivables (1210), payables (3310), advances received (3510), advances paid (1310), etc. Essential for understanding full mutual obligations with any counterparty.",
    {
      contractorGuid: z.string().uuid().describe("Contractor Ref_Key"),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (omit for current balance)"),
    },
    async ({ contractorGuid, date }) => {
      try {
        const result = await reports.getContractorBalance(contractorGuid, date);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_payments_in",
    "Get incoming bank payments (ПлатежноеПоручениеВходящее) for a period. Returns list of payments with date, number, contractor, currency, amount and payment purpose. Totals grouped by currency. Optionally filter by contractor or organization.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      contractorGuid: z.string().uuid().optional().describe("Filter by contractor Ref_Key"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, contractorGuid, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getIncomingPayments(dateFrom, dateTo, contractorGuid, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_payments_out",
    "Get outgoing bank payments (ПлатежноеПоручениеИсходящее) for a period — payments to suppliers and contractors. Returns list with date, number, contractor, currency, amount and payment purpose. Totals grouped by currency.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      contractorGuid: z.string().uuid().optional().describe("Filter by contractor Ref_Key"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, contractorGuid, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getOutgoingPayments(dateFrom, dateTo, contractorGuid, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_purchases_report",
    "Get detailed purchases report (ПоступлениеТоваровУслуг) with line-level detail: contractor, contract, currency, nomenclature, quantity, price, amount, VAT. Mirrors sales report structure. Optionally filter by contractor or organization.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      contractorGuid: z.string().uuid().optional(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, contractorGuid, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getPurchasesReport(dateFrom, dateTo, contractorGuid, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_creditors_detailed",
    "Detailed creditors report: for each creditor on accounts 3310/3350/3387/3390 shows balance, first document date, contracts, total payments made in 2024–2026, last payment date/purpose, age category, and obligation type. Sorted by balance descending.",
    {
      organizationGuid: z.string().uuid().optional().describe("Filter by organization Ref_Key"),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (omit for current)"),
    },
    async ({ organizationGuid, date }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getDetailedCreditors(org.guid, date);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_advances_received_detailed",
    "Detailed breakdown of account 3510 (advances received from buyers): per-contractor balance, first payment date, contract names, total shipments fulfilled (РеализацияТоваровУслуг), last shipment date, and age category. These are obligations to deliver goods — highest-priority liability. Sorted by balance descending.",
    {
      organizationGuid: z.string().uuid().optional().describe("Filter by organization Ref_Key"),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (omit for current)"),
    },
    async ({ organizationGuid, date }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getDetailedAdvancesReceived(org.guid, date);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_full_liabilities_report",
    "COMPREHENSIVE liabilities report covering ALL liability accounts: (1) advances received 3510 with per-contractor detail, (2) supplier payables 3310/3350/3387/3390 with contract/payment history, (3) tax liabilities 3120/3131/3150/3211-3250/4310, (4) other liabilities 3386/3430/4110, (5) OSV snapshot of all Cr-balance accounts. Grand total across all sections. Use this as the master view of all company obligations.",
    {
      organizationGuid: z.string().uuid().optional().describe("Filter by organization Ref_Key"),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (omit for current)"),
    },
    async ({ organizationGuid, date }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getFullLiabilitiesReport(org.guid, date);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_sales_report",
    "Get detailed sales report (РеализацияТоваровУслуг) with line-level detail: contractor, contract, currency, nomenclature, quantity, price, amount, VAT. Mirrors purchases report structure. Optionally filter by contractor or organization.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      contractorGuid: z.string().uuid().optional(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, contractorGuid, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getSalesReport(dateFrom, dateTo, contractorGuid, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_cash_flow",
    "Get cash flow summary for a period: bank payments in/out (ПлатежноеПоручение) + cash register in/out (КассовыйОрдер). Returns net cash flow by month and totals by document type.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getCashFlowSummary(dateFrom, dateTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_fixed_assets",
    "Get fixed assets register (ОС): accounts 2410 (initial cost) and 2420 (accumulated depreciation). Returns per-asset initial cost, accumulated depreciation, and residual (book) value. Covers tractors, combines, vehicles, and other capital equipment.",
    {
      organizationGuid: z.string().uuid().optional(),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (default: today)"),
    },
    async ({ organizationGuid, date }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getFixedAssets(org.guid, date);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_payroll_documents",
    "Get payroll accrual documents (НачислениеЗарплатыРаботникамОрганизаций) for a period. Returns per-document summary with employee breakdown: name, accrual type, amount. Use to verify salary calculations and headcount.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.getPayrollDocuments(dateFrom, dateTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_detect_anomalies",
    "Detect accounting anomalies for a period: (1) manual ОперацияБух entries — always require review, (2) suspiciously round amounts ≥1M divisible by 1M, (3) unposted documents that may affect period reporting.",
    {
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reports.detectAnomalies(dateFrom, dateTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );
}
