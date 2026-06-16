import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentValidator } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerDocumentValidationTools(server: McpServer, validator: DocumentValidator): void {
  server.tool(
    "onec_validate_document_line_totals",
    "Per-line arithmetic (qty × price = amount) and per-document header sum check on Реализация or Поступление. Samples N most recent documents. See kz-agro-validation-rules.md#A.5.",
    {
      documentType: z.enum(["РеализацияТоваровУслуг", "ПоступлениеТоваровУслуг"]),
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
      sampleLimit: z.number().int().min(1).max(500).optional().default(50),
    },
    async ({ documentType, dateFrom, dateTo, organizationGuid, sampleLimit }) => {
      try { return ok(await validator.validateLineTotals(documentType, dateFrom, dateTo, organizationGuid, sampleLimit)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_nomenclature_accounts",
    "Check nomenclature type matches its account: 1320 should only contain finished products, not services. Samples items on 1320. See kz-agro-validation-rules.md#A.5.",
    {
      date: z.string().describe("YYYY-MM-DD — check date"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ date, organizationGuid }) => {
      try { return ok(await validator.validateNomenclatureAccounts(date, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_advance_aging",
    "Flag large outstanding advances on 1710 (paid to suppliers) and 3510 (received from customers). Includes top-3 contractors per account for follow-up. See kz-agro-validation-rules.md#A.6.",
    {
      date: z.string().describe("YYYY-MM-DD — balance date"),
      organizationGuid: z.string().uuid().optional(),
      agingDays: z.number().int().min(30).max(365).optional().default(90),
    },
    async ({ date, organizationGuid, agingDays }) => {
      try { return ok(await validator.validateAdvanceAging(date, organizationGuid, agingDays)); }
      catch (e) { return wrapError(e); }
    },
  );
}
