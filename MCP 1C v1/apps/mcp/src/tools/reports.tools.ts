import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ReportsService, ProductionService, CostingService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

const reportTypeEnum = z.enum([
  // Financial reports
  "osv",
  "debtors",
  "creditors",
  "contractor-balance",
  "payments-in",
  "payments-out",
  "purchases",
  "sales",
  "creditors-detailed",
  "advances-received",
  "liabilities-full",
  "cash-flow",
  "fixed-assets",
  "payroll",
  "anomalies",
  // Production & inventory reports
  "production-wip",
  "production-materials",
  "production-finished-goods",
  "production-payroll-taxes",
  "production-vat-register",
  "production-pl-summary",
  "production-kpn-estimate",
  "inventory-stock",
  "costing-unit-cost",
  "costing-cogs-composition",
  "costing-real-production-costs",
]);

type ReportType = z.infer<typeof reportTypeEnum>;

const reportDescriptions: Record<ReportType, string> = {
  "osv": "Trial balance (ОСВ) with opening/closing balances and turnovers by account",
  "debtors": "All accounts receivable: accounts 1210, 1250, 1251, 1254, 1255",
  "creditors": "All accounts payable: accounts 3310, 3350, 3387, 3390",
  "contractor-balance": "Complete balance picture for one contractor across all accounts",
  "payments-in": "Incoming bank payments (ПлатежноеПоручениеВходящее)",
  "payments-out": "Outgoing bank payments (ПлатежноеПоручениеИсходящее)",
  "purchases": "Detailed purchases report (ПоступлениеТоваровУслуг) with line detail",
  "sales": "Detailed sales report (РеализацияТоваровУслуг) with line detail",
  "creditors-detailed": "Creditors on 3310/3350/3387/3390 with payment history and age",
  "advances-received": "Account 3510 (advances from buyers) with fulfillment tracking",
  "liabilities-full": "COMPREHENSIVE report of all liability accounts and sections",
  "cash-flow": "Cash flow summary by month: bank payments + cash register",
  "fixed-assets": "Fixed assets (ОС): 2410 cost and 2420 depreciation per asset",
  "payroll": "Payroll accrual documents (НачислениеЗарплатыРаботникамОрганизаций)",
  "anomalies": "Anomalies: manual entries, round amounts ≥1M, unposted docs",
  "production-wip": "Work-in-progress (НЗП) on account 8110 (Основное производство)",
  "production-materials": "Raw materials & supplies (account 1310)",
  "production-finished-goods": "Finished goods inventory (account 1320)",
  "production-payroll-taxes": "KZ payroll tax registers (ОПВ, СО, ВОСМС, ИПН) for period",
  "production-vat-register": "НДС register positions for period",
  "production-pl-summary": "P&L summary: revenue (6010), COGS (7010), overhead (7210)",
  "production-kpn-estimate": "КПН (corporate income tax) estimate with optional 70% agro reduction",
  "inventory-stock": "Full inventory stock report: quantity by warehouse, cost, supplier, procurement price",
  "costing-unit-cost": "Per-nomenclature unit cost: production cost, COGS, weighted average",
  "costing-cogs-composition": "COGS breakdown by cost category with sample source documents",
  "costing-real-production-costs": "Real production costs excluding WIP ping-pong inflation",
};

export function registerReportsTools(server: McpServer, reports: ReportsService, production: ProductionService, costing: CostingService): void {
  server.tool(
    "onec_get_report",
    [
      "Unified financial reports interface. Specify reportType to get:",
      Object.entries(reportDescriptions)
        .map(([type, desc]) => `  • ${type}: ${desc}`)
        .join("\n"),
    ].join("\n"),
    {
      reportType: reportTypeEnum.describe("Type of report to retrieve"),
      dateFrom: z.string().optional().describe("Start date YYYY-MM-DD (required for date-range reports)"),
      dateTo: z.string().optional().describe("End date YYYY-MM-DD (required for date-range reports)"),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (used for balance reports; defaults to today)"),
      contractorGuid: z.string().uuid().optional().describe("Filter by contractor Ref_Key"),
      organizationGuid: z.string().uuid().optional().describe("Filter by organization Ref_Key"),
      nomenclatureGuid: z.string().uuid().optional().describe("Filter by nomenclature (for costing-unit-cost)"),
      warehouseGuid: z.string().uuid().optional().describe("Filter by warehouse (for inventory-stock)"),
      isAgro: z.boolean().optional().default(false).describe("Apply 70% КПН reduction (for production-kpn-estimate)"),
      hasDeductions: z.boolean().optional().default(true).describe("Apply standard deductions for payroll tax calc"),
      grossSalary: z.number().optional().describe("Gross salary in tenge (for payroll tax calculation)"),
      perCategoryDocLimit: z.number().int().optional().default(10).describe("Max docs per cost category"),
      perDocumentSampleLimit: z.number().int().optional().default(0).describe("Sample size for per-document checks"),
      productionAccountCode: z.string().optional().default("8112").describe("Production account (KZ: 8112)"),
      wipAccountCode: z.string().optional().default("1341").describe("WIP account (KZ: 1341)"),
      finishedGoodsAccountCode: z.string().optional().default("1320").describe("Finished goods account (KZ: 1320)"),
    },
    async (params) => {
      try {
        const {
          reportType,
          dateFrom,
          dateTo,
          date,
          contractorGuid,
          organizationGuid,
          nomenclatureGuid,
          warehouseGuid,
          isAgro,
          hasDeductions,
          grossSalary,
          perCategoryDocLimit,
          perDocumentSampleLimit,
          productionAccountCode,
          wipAccountCode,
          finishedGoodsAccountCode,
        } = params;
        const org = resolveOrg(organizationGuid);
        let result: unknown;

        switch (reportType) {
          // Financial reports
          case "osv":
            if (!dateFrom || !dateTo) throw new Error("osv requires dateFrom and dateTo");
            result = await reports.getOSV(dateFrom, dateTo, org.guid);
            break;
          case "debtors":
            result = await reports.getAllDebtors(org.guid, date);
            break;
          case "creditors":
            result = await reports.getAllCreditors(org.guid, date);
            break;
          case "contractor-balance":
            if (!contractorGuid) throw new Error("contractor-balance requires contractorGuid");
            result = await reports.getContractorBalance(contractorGuid, date);
            break;
          case "payments-in":
            if (!dateFrom || !dateTo) throw new Error("payments-in requires dateFrom and dateTo");
            result = await reports.getIncomingPayments(dateFrom, dateTo, contractorGuid, org.guid);
            break;
          case "payments-out":
            if (!dateFrom || !dateTo) throw new Error("payments-out requires dateFrom and dateTo");
            result = await reports.getOutgoingPayments(dateFrom, dateTo, contractorGuid, org.guid);
            break;
          case "purchases":
            if (!dateFrom || !dateTo) throw new Error("purchases requires dateFrom and dateTo");
            result = await reports.getPurchasesReport(dateFrom, dateTo, contractorGuid, org.guid);
            break;
          case "sales":
            if (!dateFrom || !dateTo) throw new Error("sales requires dateFrom and dateTo");
            result = await reports.getSalesReport(dateFrom, dateTo, contractorGuid, org.guid);
            break;
          case "creditors-detailed":
            result = await reports.getDetailedCreditors(org.guid, date);
            break;
          case "advances-received":
            result = await reports.getDetailedAdvancesReceived(org.guid, date);
            break;
          case "liabilities-full":
            result = await reports.getFullLiabilitiesReport(org.guid, date);
            break;
          case "cash-flow":
            if (!dateFrom || !dateTo) throw new Error("cash-flow requires dateFrom and dateTo");
            result = await reports.getCashFlowSummary(dateFrom, dateTo, org.guid);
            break;
          case "fixed-assets":
            result = await reports.getFixedAssets(org.guid, date);
            break;
          case "payroll":
            if (!dateFrom || !dateTo) throw new Error("payroll requires dateFrom and dateTo");
            result = await reports.getPayrollDocuments(dateFrom, dateTo, org.guid);
            break;
          case "anomalies":
            if (!dateFrom || !dateTo) throw new Error("anomalies requires dateFrom and dateTo");
            result = await reports.detectAnomalies(dateFrom, dateTo, org.guid);
            break;

          // Production & inventory reports
          case "production-wip":
            result = await production.getProductionCosts(org.guid, date);
            break;
          case "production-materials":
            result = await production.getMaterialsBalance(org.guid, date, nomenclatureGuid);
            break;
          case "production-finished-goods":
            result = await production.getFinishedGoodsBalance(org.guid, date);
            break;
          case "production-payroll-taxes":
            if (!dateFrom || !dateTo) throw new Error("production-payroll-taxes requires dateFrom and dateTo");
            result = await production.getPayrollTaxesSummary(org.guid, dateFrom, dateTo);
            break;
          case "production-vat-register":
            if (!dateFrom || !dateTo) throw new Error("production-vat-register requires dateFrom and dateTo");
            result = await production.getVatRegister(org.guid, dateFrom, dateTo);
            break;
          case "production-pl-summary":
            if (!dateFrom || !dateTo) throw new Error("production-pl-summary requires dateFrom and dateTo");
            result = await production.getPLSummary(org.guid, dateFrom, dateTo);
            break;
          case "production-kpn-estimate":
            if (!dateFrom || !dateTo) throw new Error("production-kpn-estimate requires dateFrom and dateTo");
            result = await production.getKPNEstimate(org.guid, dateFrom, dateTo, isAgro ?? false);
            break;
          case "inventory-stock":
            result = await reports.getStockReport(org.guid, date, warehouseGuid, dateFrom);
            break;
          case "costing-unit-cost":
            if (!nomenclatureGuid) throw new Error("costing-unit-cost requires nomenclatureGuid");
            if (!dateFrom || !dateTo) throw new Error("costing-unit-cost requires dateFrom and dateTo");
            result = await costing.getNomenclatureUnitCost(nomenclatureGuid, dateFrom, dateTo, org.guid);
            break;
          case "costing-cogs-composition":
            if (!dateFrom || !dateTo) throw new Error("costing-cogs-composition requires dateFrom and dateTo");
            result = await costing.getCOGSCompositionWithDocs(dateFrom, dateTo, org.guid, perCategoryDocLimit ?? 10);
            break;
          case "costing-real-production-costs":
            if (!dateFrom || !dateTo) throw new Error("costing-real-production-costs requires dateFrom and dateTo");
            result = await costing.getRealProductionCosts(
              dateFrom,
              dateTo,
              org.guid,
              productionAccountCode ?? "8112",
              wipAccountCode ?? "1341",
              finishedGoodsAccountCode ?? "1320",
            );
            break;

          default:
            throw new Error(`Unknown report type: ${reportType}`);
        }

        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) {
        return wrapError(e);
      }
    },
  );
}
