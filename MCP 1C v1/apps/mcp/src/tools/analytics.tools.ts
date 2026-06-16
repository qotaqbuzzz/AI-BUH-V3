import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AnalyticsService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerAnalyticsTools(server: McpServer, analytics: AnalyticsService): void {
  server.tool(
    "onec_get_monthly_trend",
    "Get monthly P&L trend: revenue (6010), COGS (7010), overhead (7210), gross profit, and operating profit broken down by month. Essential for seasonal agricultural analysis — shows planting vs harvest income pattern. Returns one row per month plus totals.",
    {
      dateFrom: z.string().describe("Start month YYYY-MM-DD (use first day of month)"),
      dateTo: z.string().describe("End month YYYY-MM-DD (use last day of month)"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await analytics.getMonthlyTrend(dateFrom, dateTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_financial_summary",
    "Get a complete financial snapshot for an organization: cash (1010+1030), AR (1210), AP (3310), VAT liability (3130-1420), КПН (3110). Parallel account balance fetch.",
    {
      organizationGuid: z.string().uuid().optional().describe("Organization Ref_Key (injected server-side if omitted)"),
      date: z.string().optional().describe("As-of date YYYY-MM-DD (default: today)"),
    },
    async ({ organizationGuid, date }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await analytics.getFinancialSummary(org.guid, date);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );
}
