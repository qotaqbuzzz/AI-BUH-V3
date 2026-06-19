import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CostCenterService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerCostCenterTools(server: McpServer, svc: CostCenterService): void {
  server.tool(
    "onec_get_cost_center_summary",
    "Returns expenses by cost center (Catalog_ПодразделенияОрганизаций) for the period, split between direct costs (70%) and allocated overhead (30%). Total expenses are sourced from GL account 7210 turnovers distributed equally across departments. Use for management accounting and responsibility reporting. Drill: call onec_analyze_overhead_allocation for a detailed overhead driver analysis.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getCostCenterSummary(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.costCenters.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_analyze_overhead_allocation",
    "Computes overhead allocation from GL account 8410 (общепроизводственные расходы) across cost centers using equal-split method. Returns total overhead, allocation amounts per department, and percentage share. The allocationMethod field identifies the basis used. Drill: to implement driver-based allocation, call onec_get_cost_center_summary with direct-cost weights.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.analyzeOverheadAllocation(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_departmental_profitability",
    "Returns contribution margin analysis per department: revenue (account 6010 split equally), direct costs, allocated overhead, net contribution, and margin percent. Negative-margin departments are loss centers requiring management attention. Drill: for any loss center, call onec_get_cost_center_summary to decompose expenses, then onec_analyze_overhead_allocation to challenge the allocation method.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getDepartmentalProfitability(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.departments.length });
      } catch (e) { return wrapError(e); }
    },
  );
}
