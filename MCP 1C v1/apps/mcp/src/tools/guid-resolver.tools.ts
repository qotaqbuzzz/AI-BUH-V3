import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GuidResolverService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerGuidResolverTools(server: McpServer, svc: GuidResolverService): void {
  server.tool(
    "onec_resolve_guid",
    [
      "Resolve a 1C GUID (Ref_Key) to its entity type and human-readable name.",
      "Searches Catalog, Document, ChartOfAccounts and all other entity sets.",
      "Use the 'hint' field to skip straight to the correct entity set when the type is known.",
    ].join(" "),
    {
      guid: z.string().uuid().describe("GUID to resolve, e.g. '9b2e4f3c-a1b2-4c3d-8e5f-000000000001'"),
      hint: z.string().optional().describe(
        "Optional OData entity set name to try first, e.g. 'Catalog_Контрагенты'. " +
        "Speeds up lookup when the entity type is already known.",
      ),
    },
    async ({ guid, hint }) => {
      try {
        return ok(await svc.resolveGuid(guid, hint));
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_resolve_guids",
    "Resolve up to 50 1C GUIDs in parallel. Returns an array of resolutions in input order. " +
    "Useful for annotating a list of Ref_Key values extracted from documents or registers.",
    {
      guids: z.array(z.string().uuid()).min(1).max(50)
        .describe("Array of GUIDs to resolve (max 50)"),
    },
    async ({ guids }) => {
      try {
        return ok(await svc.resolveGuids(guids));
      } catch (e) { return wrapError(e); }
    },
  );
}
