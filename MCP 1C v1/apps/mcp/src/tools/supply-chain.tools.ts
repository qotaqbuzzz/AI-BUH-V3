import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SupplyChainAnalyticsService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerSupplyChainTools(server: McpServer, svc: SupplyChainAnalyticsService): void {
  server.tool(
    "onec_get_supplier_performance",
    "Returns supplier performance metrics for the period: total purchases, document count, average invoice amount, return count, return amount, and return rate. Sourced from Document_ПоступлениеТоваровУслуг and Document_ВозвратТоваровПоставщику. Sorted by total purchases descending. Drill: call onec_get_supplier_concentration for HHI analysis, or onec_get_account_card('3310', ...) to trace AP movements by supplier.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getSupplierPerformance(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_spend_by_category",
    "Returns procurement spend aggregated by nomenclature category for the period. Useful for spend analytics and category management. Each category shows total amount, document count, and percent of grand total. Drill: call onec_get_supplier_performance to see which suppliers drive spend within a category.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getSpendByCategory(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_supplier_concentration",
    "Returns top-10 suppliers by spend with their combined share of total procurement (top10Percent) and a Herfindahl-Hirschman Index (HHI) measuring supplier concentration risk. HHI > 2500 indicates high concentration. Drill: for any high-concentration supplier, call onec_get_supplier_performance to review return rate and payment terms.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getSupplierConcentration(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );
}
