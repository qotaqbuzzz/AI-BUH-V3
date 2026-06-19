import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CustomsService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerCustomsTools(server: McpServer, svc: CustomsService): void {
  server.tool(
    "onec_get_import_summary",
    "Returns all import declarations (Document_ГТДИмпорт) for the period with customs value, duty amount (actual or 5% estimate), VAT, and total landed cost. Aggregates to totals. Use for customs cost analysis and trade finance. Drill: call onec_calculate_landed_cost for a specific shipment to recompute with actual HS code tariff rates.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getImportSummary(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.documentCount });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_calculate_landed_cost",
    "Calculates total landed cost for an import shipment: CIF (goods + freight + insurance) → duty (HS code tariff rate) → VAT (12% on CIF+duty) → total landed cost. Returns full cost breakdown with percentages and optional cost-per-unit. Supported HS code prefixes: 8471, 8517 (0%), 8701-8703 (5%); all others default to 5% per КЗ tariff schedule. Use before booking inventory to ensure accurate cost capitalization.",
    {
      goodsValue: z.number().positive().describe("Invoice value of goods in KZT"),
      freightCost: z.number().min(0).describe("Freight/transport cost in KZT"),
      insuranceCost: z.number().min(0).describe("Insurance cost in KZT"),
      hsCode: z.string().min(4).describe("HS code (minimum 4 digits), e.g. '8471', '8703'"),
      quantity: z.number().positive().optional().describe("Quantity of units (for cost-per-unit calculation)"),
    },
    async ({ goodsValue, freightCost, insuranceCost, hsCode, quantity }) => {
      try {
        const result = await svc.calculateLandedCost(goodsValue, freightCost, insuranceCost, hsCode, quantity);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );
}
