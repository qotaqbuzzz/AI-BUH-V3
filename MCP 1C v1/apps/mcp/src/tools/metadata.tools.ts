import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MetadataService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerMetadataTools(server: McpServer, meta: MetadataService): void {
  server.tool(
    "onec_get_metadata",
    "List available entity types from the 1C $metadata endpoint. Use this to discover what catalogs, documents, and registers are available before querying.",
    {
      entityType: z.enum(["Catalog", "Document", "Register", "all"]).optional().default("all")
        .describe("Filter: 'Catalog', 'Document', 'Register', or 'all'"),
    },
    async ({ entityType }) => {
      try {
        const entities = await meta.getEntities(entityType as "Catalog" | "Document" | "Register" | "all");
        const summary = {
          total: entities.length,
          entities: entities.map(e => e.name),
        };
        return ok(summary);
      } catch (e) { return wrapError(e); }
    },
  );
}
