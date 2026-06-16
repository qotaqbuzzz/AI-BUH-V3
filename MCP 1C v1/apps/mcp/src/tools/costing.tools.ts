import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CostingService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerCostingTools(server: McpServer, costing: CostingService): void {

  server.tool(
    "onec_get_nomenclature_unit_cost",
    "Returns per-nomenclature unit cost for a period: (1) production unit cost = Дт 1320 / qty capitalised at harvest; (2) COGS unit cost = Дт 7010 / qty sold; (3) opening/closing inventory with weighted-average. Use onec_search_nomenclature first to get nomenclatureGuid (e.g. search 'пшеница'). Typical question: 'себестоимость 1 тонны пшеницы 2025 года'. See kz-agro-costing-flow.md.",
    {
      nomenclatureGuid: z.string().uuid().describe("GUID from Catalog_Номенклатура — use onec_search_nomenclature to obtain"),
      dateFrom:         z.string().describe("Period start, e.g. '2025-01-01'"),
      dateTo:           z.string().describe("Period end, e.g. '2025-12-31'"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ nomenclatureGuid, dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await costing.getNomenclatureUnitCost(nomenclatureGuid, dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_cogs_composition",
    "Shows what production costs flow into COGS: groups account 8110/8112 Дт turnover by corr-account (1310 materials, 3350 payroll, 3211/3213/3250 employer charges, 2420 depreciation, 8412 overhead). Returns % breakdown and sample source documents per category. Answers 'из чего состоит себестоимость'. See kz-agro-costing-flow.md.",
    {
      dateFrom:             z.string(),
      dateTo:               z.string(),
      organizationGuid:     z.string().uuid().optional(),
      perCategoryDocLimit:  z.number().int().min(1).max(50).default(10).optional()
                              .describe("Max sample documents per cost category (default 10)"),
    },
    async ({ dateFrom, dateTo, organizationGuid, perCategoryDocLimit }) => {
      try { return ok(await costing.getCOGSCompositionWithDocs(dateFrom, dateTo, organizationGuid, perCategoryDocLimit ?? 10)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_real_production_costs",
    "Returns TRUE production cost excluding НЗП ping-pong inflation. Each month 1C closes the production account (8112) to WIP (1341) and re-opens it next month — this inflates raw Дт turnover 4–5×. This tool filters those inter-account transfers and returns: (1) real new costs by cost item (Catalog_СтатьиЗатрат); (2) harvest capitalized by product group (Кт to 1320); (3) cross-check: realCosts − harvest = WIP net increase. Account codes are configurable for non-agro (e.g. 2010/2110/4300 Russian chart). Typical question: 'реальная себестоимость производства по статьям затрат'.",
    {
      dateFrom:                 z.string().describe("Period start, e.g. '2025-01-01'"),
      dateTo:                   z.string().describe("Period end, e.g. '2025-12-31'"),
      organizationGuid:         z.string().uuid().optional(),
      productionAccountCode:    z.string().default("8112").optional().describe("Production cost account (KZ default: 8112, RU: 2010/2020)"),
      wipAccountCode:           z.string().default("1341").optional().describe("WIP account (KZ default: 1341, RU: 2110/2120)"),
      finishedGoodsAccountCode: z.string().default("1320").optional().describe("Finished goods account (KZ default: 1320, RU: 4300)"),
    },
    async ({ dateFrom, dateTo, organizationGuid, productionAccountCode, wipAccountCode, finishedGoodsAccountCode }) => {
      try {
        return ok(await costing.getRealProductionCosts(
          dateFrom, dateTo, organizationGuid,
          productionAccountCode ?? "8112",
          wipAccountCode ?? "1341",
          finishedGoodsAccountCode ?? "1320",
        ));
      } catch (e) { return wrapError(e); }
    },
  );
}
