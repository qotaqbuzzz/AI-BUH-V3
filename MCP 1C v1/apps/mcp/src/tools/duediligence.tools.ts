import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ReportsService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerDueDiligenceTools(server: McpServer, reports: ReportsService): void {

  server.tool(
    "onec_get_advance_settlement",
    "For a contractor who has paid advances (account 3510 / 3387), shows: total advance received (Кт turnover), total offset against deliveries (Дт turnover), remaining outstanding balance, and fulfillment %. Essential for investigating unreconciled advance positions — e.g. checking how much of an advance-buyer's prepayments have been fulfilled by actual shipments.",
    {
      contractorGuid:   z.string().uuid().describe("Contractor Ref_Key"),
      organizationGuid: z.string().uuid().optional().describe("Filter by organization"),
      dateFrom:         z.string().optional().default("2000-01-01").describe("Analysis start date YYYY-MM-DD"),
      dateTo:           z.string().optional().describe("Analysis end date YYYY-MM-DD (default: today)"),
    },
    async ({ contractorGuid, organizationGuid, dateFrom, dateTo }) => {
      try {
        const result = await reports.getAdvanceSettlementStatus(
          contractorGuid,
          organizationGuid,
          dateFrom,
          dateTo,
        );
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_sales_with_lines",
    "Get Реализации (sales invoices) for one or more contractors with FULL line detail: nomenclature name, quantity, unit, price, amount, VAT. Accepts multiple contractor GUIDs to query an entire corporate group at once. Returns rows per document, plus a byNomenclature aggregate (total tonnes/units and amounts per product). Use to answer: 'What goods and how many tonnes were shipped to the SSA/ANCILE group?'",
    {
      contractorGuids: z.array(z.string().uuid()).min(1).max(20)
        .describe("One or more contractor Ref_Keys (supply all group members together)"),
      dateFrom:         z.string().describe("Start date YYYY-MM-DD"),
      dateTo:           z.string().describe("End date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ contractorGuids, dateFrom, dateTo, organizationGuid }) => {
      try {
        const result = await reports.getSalesWithLines(contractorGuids, dateFrom, dateTo, organizationGuid);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_group_balance",
    "Consolidated balance across ALL accounting accounts for a group of related contractors (e.g. the full SSA / ANCILE ecosystem). Aggregates ExtDimension rows for every member GUID into a single account-by-account view. Use to answer: 'What is our total net position with the entire SSA group across all accounts?'",
    {
      contractorGuids: z.array(z.string().uuid()).min(1).max(30)
        .describe("All contractor Ref_Keys that belong to the group"),
      groupLabel:       z.string().describe("Label for the group, e.g. 'SSA Group'"),
      date:             z.string().optional().describe("As-of date YYYY-MM-DD (omit for current)"),
    },
    async ({ contractorGuids, groupLabel, date }) => {
      try {
        const result = await reports.getGroupBalance(contractorGuids, groupLabel, date);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );
}
