import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ConsolidationService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerConsolidationTools(server: McpServer, svc: ConsolidationService): void {
  server.tool(
    "onec_get_inter_org_transactions",
    "Identifies inter-company sales transactions between organizations in the same group. Filters Document_РеализацияТоваровУслуг where both the selling organization and the buyer (Контрагент) are in the provided orgGuids list. Returns all cross-entity transactions for the period. Drill: call onec_calculate_consolidation_eliminations to compute the required eliminating entries.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      orgGuids: z.array(z.string().uuid()).min(2).describe("List of organization Ref_Keys in the consolidation group (minimum 2)"),
    },
    async ({ periodFrom, periodTo, orgGuids }) => {
      try {
        const result = await svc.getInterOrgTransactions(periodFrom, periodTo, orgGuids);
        return ok(result, { rowCount: result.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_calculate_consolidation_eliminations",
    "Calculates the journal entries required to eliminate inter-company revenue and COGS from a consolidated P&L. For each inter-company sale identified by onec_get_inter_org_transactions, returns the elimination entry (Debit 6010 / Credit 7010). A balanced: true result confirms eliminations net to zero. Drill: validate individual inter-company amounts using onec_get_inter_org_transactions.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      orgGuids: z.array(z.string().uuid()).min(2).describe("Organization Ref_Keys in the consolidation group"),
    },
    async ({ periodFrom, periodTo, orgGuids }) => {
      try {
        const result = await svc.calculateConsolidationEliminations(periodFrom, periodTo, orgGuids);
        return ok(result, { rowCount: result.eliminations.length });
      } catch (e) { return wrapError(e); }
    },
  );
}
