import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RelatedPartyService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerRelatedPartyTools(server: McpServer, svc: RelatedPartyService): void {
  server.tool(
    "onec_identify_related_party_transactions",
    "Identifies transactions (sales and purchases) with related parties by filtering Document_РеализацияТоваровУслуг and Document_ПоступлениеТоваровУслуг where the counterparty has the СвязаннаяСторона flag set in Catalog_Контрагенты. Required for IFRS IAS 24 disclosures. If no related parties are flagged, returns a note with configuration instructions. Drill: call onec_validate_rpt_pricing to check if related-party prices are within market tolerance.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.identifyRelatedPartyTransactions(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.rptCount });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_rpt_pricing",
    "Validates that related-party transaction prices are within the specified market tolerance (default ±10%). Returns passed flag and any pricing anomalies. Full market-price comparison requires a reference price list in 1C. Returns a note explaining the limitation if no price reference is available. Drill: for anomalous transactions, call onec_get_document(documentGuid) to inspect line-item pricing.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
      priceTolerancePercent: z.number().min(0).max(50).optional().default(10).describe("Acceptable price deviation from market price (default: 10%)"),
    },
    async ({ periodFrom, periodTo, organizationGuid, priceTolerancePercent }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.validateRptPricing(periodFrom, periodTo, org.guid, priceTolerancePercent);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );
}
