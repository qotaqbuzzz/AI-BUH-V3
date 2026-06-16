/**
 * types.ts — re-exports the canonical schema and keeps backward-compatible
 * names that existing service/tool code depends on.
 *
 * New code: import from "@aibos/onec-client" and use the Catalog_* / Document_*
 * names defined in schema.ts.
 */
export { DOCUMENT_TYPES, toGuid } from "./schema.js";
//# sourceMappingURL=types.js.map