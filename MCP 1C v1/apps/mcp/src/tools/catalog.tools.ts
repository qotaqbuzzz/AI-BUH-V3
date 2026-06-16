import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CatalogService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerCatalogTools(server: McpServer, catalog: CatalogService): void {
  server.tool(
    "onec_search_contractors",
    "Search 1C counterparties (Контрагенты) by name, РНН, or IIC. Returns up to 'limit' matches.",
    {
      query: z.string().min(1).max(200).describe("Name fragment, РНН (9 digits), or ИдентификационныйКодЛичности"),
      limit: z.number().int().min(1).max(100).optional().default(20).describe("Max results"),
    },
    async ({ query, limit }) => {
      try {
        const rows = await catalog.searchContractors(query, limit);
        return ok(rows);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_contractor",
    "Get full counterparty details by GUID, including main contract and bank account.",
    { guid: z.string().uuid().describe("Ref_Key of the contractor") },
    async ({ guid }) => {
      try {
        const row = await catalog.getContractor(guid);
        return ok(row);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_search_nomenclature",
    "Search 1C nomenclature (products/services) by name or article (Артикул).",
    {
      query: z.string().min(1).max(200).describe("Name fragment or article number"),
      isService: z.boolean().optional().describe("true = services only, false = goods only, omit = both"),
      limit: z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ query, isService, limit }) => {
      try {
        const rows = await catalog.searchNomenclature(query, isService, limit);
        return ok(rows);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_warehouses",
    "List all warehouses (Catalog_Склады) in the 1C database. Returns GUID, name, and code. Use to get warehouse GUIDs for stock and movement queries.",
    {},
    async () => {
      try {
        const rows = await catalog.getWarehouses();
        return ok(rows);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_contractor_contracts",
    "List all contracts (Catalog_ДоговорыКонтрагентов) for a contractor. Returns contract name, type (ВидДоговора), currency, amount, and dates. Use to understand payment terms and contract structure before analyzing settlements.",
    {
      contractorGuid: z.string().uuid().describe("Contractor Ref_Key"),
    },
    async ({ contractorGuid }) => {
      try {
        const rows = await catalog.getContractorContracts(contractorGuid);
        return ok(rows);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_organizations",
    "List all organizations (Организации) in the 1C database with BIN (ИдентификационныйНомер) and РНН.",
    {},
    async () => {
      try {
        const rows = await catalog.getOrganizations();
        return ok(rows);
      } catch (e) { return wrapError(e); }
    },
  );
}
