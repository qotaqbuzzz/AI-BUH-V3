import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DOCUMENT_TYPES } from "@aibos/onec-client";
import type { DocumentScannerService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerScanTools(server: McpServer, scanner: DocumentScannerService): void {

  server.tool(
    "onec_scan_documents",
    [
      "Iterates through every document of selected types in the given period and flags errors at the individual-document level.",
      "Checks: DOC-001 unposted documents, DOC-002 missing contractor, DOC-003 zero-amount financial documents.",
      "Returns a ScanReport with summary counts and per-document findings (documentGuid, documentNumber, description, suggestedFix).",
      "Use limitPerType=10 for a quick test run. Use docTypes to scan a specific subset.",
    ].join(" "),
    {
      organizationGuid: z.string().uuid().describe("Organization Ref_Key — use onec_get_organizations to obtain"),
      dateFrom:         z.string().describe("Period start YYYY-MM-DD"),
      dateTo:           z.string().describe("Period end YYYY-MM-DD"),
      docTypes:         z.array(z.string()).optional()
        .describe(`Subset of document types to scan. Default: all ${DOCUMENT_TYPES.length} types. Examples: ["РеализацияТоваровУслуг","ПоступлениеТоваровУслуг"]`),
      limitPerType:     z.number().int().min(1).max(1000).optional()
        .describe("Scan only the first N documents per type (for quick test runs, e.g. 10)"),
      maxFindingsPerCheck: z.number().int().min(10).max(500).optional().default(100)
        .describe("Max findings returned per check ID (prevents response overflow, default 100)"),
    },
    async ({ organizationGuid, dateFrom, dateTo, docTypes, limitPerType, maxFindingsPerCheck }) => {
      try {
        const report = await scanner.scanDocuments(organizationGuid, dateFrom, dateTo, {
          docTypes: docTypes as string[] | undefined,
          limitDocsPerType: limitPerType,
          maxFindingsPerCheck,
        });
        return ok(report);
      } catch (e) {
        return wrapError(e);
      }
    },
  );

  server.tool(
    "onec_scan_all",
    [
      "Full object-level scan: reads every document AND every accounting posting (journal entry) in the period.",
      "Document checks (DOC-*): unposted docs, missing contractor, zero-amount documents.",
      "Posting checks (POST-*): circular postings (Дт=Кт same account), zero-amount postings, red storno (negative amount).",
      "Returns a merged ScanReport sorted by severity (critical → error → warn → info) with scanned counts and per-item findings.",
      "Set includePostings=false to scan only document headers (faster). Use limitPerType for quick test runs.",
      "TIP: For large databases (>5,000 docs/year) consider scanning one month at a time or one docType at a time.",
    ].join(" "),
    {
      organizationGuid:    z.string().uuid().describe("Organization Ref_Key — use onec_get_organizations to obtain"),
      dateFrom:            z.string().describe("Period start YYYY-MM-DD"),
      dateTo:              z.string().describe("Period end YYYY-MM-DD"),
      includePostings:     z.boolean().optional().default(true)
        .describe("Whether to also scan accounting register postings (default true, set false for headers-only, faster)"),
      docTypes:            z.array(z.string()).optional()
        .describe("Subset of document types. Default: all types."),
      limitPerType:        z.number().int().min(1).max(1000).optional()
        .describe("Scan only the first N documents per type (for quick test runs)"),
      maxFindingsPerCheck: z.number().int().min(10).max(500).optional().default(100)
        .describe("Max findings per check ID (default 100)"),
      batchSize:           z.number().int().min(50).max(1000).optional().default(200)
        .describe("OData page size (default 200, reduce to 50 if timeouts occur)"),
      delayMs:             z.number().int().min(0).max(2000).optional().default(100)
        .describe("Delay between OData pages in ms (default 100, increase to 500 if server is overloaded)"),
    },
    async ({ organizationGuid, dateFrom, dateTo, includePostings, docTypes, limitPerType, maxFindingsPerCheck, batchSize, delayMs }) => {
      try {
        const report = await scanner.runFullScan(organizationGuid, dateFrom, dateTo, {
          includePostings,
          docTypes: docTypes as string[] | undefined,
          limitDocsPerType: limitPerType,
          maxFindingsPerCheck,
          batchSize,
          delayMs,
        });
        return ok(report);
      } catch (e) {
        return wrapError(e);
      }
    },
  );
}
