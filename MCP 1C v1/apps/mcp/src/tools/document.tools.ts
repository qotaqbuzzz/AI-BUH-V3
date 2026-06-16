import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocumentService } from "@aibos/services";
import { DOCUMENT_TYPES, type DocumentType } from "@aibos/onec-client";
import { wrapError, ok } from "./utils.js";

const DocumentTypeEnum = z.enum([...DOCUMENT_TYPES] as [DocumentType, ...DocumentType[]]);

export function registerDocumentTools(server: McpServer, docs: DocumentService): void {
  server.tool(
    "onec_search_documents",
    "Search 1C documents by type, date range, contractor GUID, and posted status.",
    {
      documentType: DocumentTypeEnum.describe("1C document type"),
      dateFrom: z.string().optional().describe("Start date YYYY-MM-DD"),
      dateTo: z.string().optional().describe("End date YYYY-MM-DD"),
      contractorGuid: z.string().optional().describe("Ref_Key of contractor"),
      organizationGuid: z.string().optional().describe("Ref_Key of organization"),
      posted: z.boolean().optional().describe("Filter by Posted status"),
      limit: z.number().int().min(1).max(500).optional().default(50),
    },
    async ({ documentType, dateFrom, dateTo, contractorGuid, organizationGuid, posted, limit }) => {
      try {
        const rows = await docs.searchDocuments({ documentType, dateFrom, dateTo, contractorGuid, organizationGuid, posted, limit });
        return ok(rows);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_document",
    "Get a full 1C document with all tabular sections (Товары, Услуги, РасшифровкаПлатежа) by GUID.",
    {
      documentType: DocumentTypeEnum,
      guid: z.string().uuid().describe("Ref_Key of the document"),
    },
    async ({ documentType, guid }) => {
      try {
        const row = await docs.getDocument(documentType, guid);
        return ok(row);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_create_document",
    "Create any 1C object (catalog element or document header) by passing the entity set name and field values. Does NOT post the document.",
    {
      entitySet: z.string().describe("OData entity set name, e.g. 'Document_РеализацияТоваровУслуг' or 'Catalog_Контрагенты'"),
      data: z.record(z.unknown()).describe("Field values as a JSON object"),
    },
    async ({ entitySet, data }) => {
      try {
        const row = await docs.createDocument(entitySet, data as Record<string, unknown>);
        return ok(row);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_post_document",
    "Post (провести) or unpost a 1C document. Posting creates accounting entries in AccountingRegister_Типовой.",
    {
      documentType: z.string().describe("Document type name without 'Document_' prefix"),
      guid: z.string().uuid().describe("Ref_Key of the document"),
      action: z.enum(["post", "unpost"]).describe("'post' = провести, 'unpost' = отменить проведение"),
    },
    async ({ documentType, guid, action }) => {
      try {
        if (action === "post") {
          await docs.postDocument(documentType, guid);
        } else {
          await docs.unpostDocument(documentType, guid);
        }
        return { content: [{ type: "text", text: JSON.stringify({ success: true, action, documentType, guid }) }] };
      } catch (e) { return wrapError(e); }
    },
  );
}
