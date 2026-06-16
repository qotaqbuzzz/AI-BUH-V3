import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ReportsService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerStockTools(server: McpServer, reports: ReportsService): void {

  server.tool(
    "onec_get_stock_report",
    "Full inventory stock report (accounts 1310 Materials, 1320 Finished goods, 1330 Goods for resale). " +
    "For each item: quantity on hand per warehouse with warehouse names, total cost value, weighted average cost price, " +
    "last procurement price and date from ПоступлениеТоваровУслуг within the procurement window, " +
    "last supplier name and GUID, document number. Sorted by total cost value descending. " +
    "Use dateFrom to narrow the procurement price lookup (e.g. current year only). " +
    "Use dateTo to get a historical balance as of that date. " +
    "Use to answer: 'What do we have in stock, at what price, from whom, and where?'",
    {
      organizationGuid: z.string().uuid().optional()
        .describe("Filter by organization Ref_Key"),
      dateTo: z.string().optional()
        .describe("Balance as-of date YYYY-MM-DD (default: today)"),
      dateFrom: z.string().optional()
        .describe("Start of procurement price lookup window YYYY-MM-DD (default: 12 months before dateTo). Use to restrict which purchase documents are scanned for last price."),
      warehouseGuid: z.string().uuid().optional()
        .describe("Filter by specific warehouse Ref_Key (omit for all warehouses)"),
    },
    async ({ organizationGuid, dateTo, dateFrom, warehouseGuid }) => {
      try {
        const result = await reports.getStockReport(organizationGuid, dateTo, warehouseGuid, dateFrom);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );
}
