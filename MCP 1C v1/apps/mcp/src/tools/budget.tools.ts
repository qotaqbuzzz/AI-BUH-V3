import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { BudgetService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerBudgetTools(server: McpServer, svc: BudgetService): void {
  server.tool(
    "onec_get_budget_vs_actual",
    "Compares actual GL turnovers (accounts 6010 revenue, 7010 COGS, 7210 opex) against budget data from InformationRegister_БюджетныеПоказатели. If no budget data is found in 1C, returns actuals with zero budgets and a dataSource note advising to create budget registers. Variance = budget − actual. Drill: call onec_analyze_variance_drivers to rank the largest variance contributors.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getBudgetVsActual(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, note: result.dataSource });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_forecast_year_end",
    "Projects full-year revenue, expenses, and net income by extrapolating YTD actuals (revenue from account 6010, costs from 7010+7210) using a straight-line monthly factor (12 / monthsElapsed). Returns projected year-end P&L and months remaining. Use for board reporting and covenant compliance checks. Drill: call onec_get_budget_vs_actual to compare projection against budget.",
    {
      periodFrom: z.string().describe("YTD start date YYYY-MM-DD"),
      periodTo: z.string().describe("YTD end date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.forecastYearEnd(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_analyze_variance_drivers",
    "Ranks P&L accounts by absolute variance (budget vs actual) and computes each account's contribution to total variance as a percentage. The top drivers typically explain >80% of variance. Use to focus management attention on the most material line items. Drill: for the top driver account, call onec_get_account_card to inspect individual transactions.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.analyzeVarianceDrivers(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );
}
