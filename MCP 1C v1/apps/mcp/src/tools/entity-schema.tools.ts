/**
 * MCP tools for the offline 1C entity schema browser.
 *
 * These tools expose the Entities/ folder (889 .md files — the full 1C KZ OData schema)
 * so Claude can look up exact field names, types, and relationships before
 * building OData queries with onec_create_document, onec_search_documents, etc.
 *
 * Tools:
 *   onec_get_entity_schema  — full property list + relations for one entity
 *   onec_search_entities    — find entities by name fragment / category
 *   onec_find_field         — which entities contain a given field name?
 */

import { McpServer }          from "@modelcontextprotocol/sdk/server/mcp.js";
import { z }                  from "zod";
import type { EntitySchemaService } from "@aibos/services";
import { ok, wrapError }      from "./utils.js";

const CATEGORY_ENUM = z.enum([
  "Catalog",
  "Document",
  "AccumulationRegister",
  "InformationRegister",
  "AccountingRegister",
  "ChartOfAccounts",
  "ChartOfCalculationTypes",
  "ChartOfCharacteristicTypes",
  "DocumentJournal",
]).optional();

export function registerEntitySchemaTools(
  server:  McpServer,
  service: EntitySchemaService,
): void {

  // ── Availability stub ──────────────────────────────────────────────────────
  if (!service.isAvailable) {
    server.tool(
      "onec_entity_schema_status",
      "Reports that the entity schema index is unavailable (Entities/ folder not found or not configured). Set the ENTITIES_DIR environment variable to the absolute path of the Entities/ folder.",
      {},
      async () => ok({
        available: false,
        message:   "Entity schema index is not loaded. Set ENTITIES_DIR in .env to the path of the Entities/ folder.",
        hint:      "Default path: <project-root>/Entities (relative to apps/mcp/src → ../../../Entities)",
      }),
    );
    return;
  }

  // ── onec_get_entity_schema ─────────────────────────────────────────────────
  server.tool(
    "onec_get_entity_schema",
    [
      "Look up the complete OData schema for any 1C entity: all field names, Edm types, nullable flags, and foreign-key relationships.",
      "Use this BEFORE building onec_create_document, onec_search_documents, or any raw OData call to confirm exact Cyrillic field names.",
      "Examples: 'Document_АвансовыйОтчет' (42 fields), 'Catalog_Контрагенты' (~30 fields), 'AccumulationRegister_ТоварыОрганизацийБУ'.",
      "If you only know part of the name, call onec_search_entities first.",
    ].join(" "),
    {
      entityName: z.string().min(1).max(200)
        .describe("Exact OData entity name, e.g. 'Document_АвансовыйОтчет', 'Catalog_Контрагенты', 'AccumulationRegister_НДС'"),
    },
    async ({ entityName }) => {
      try {
        const schema = service.getSchema(entityName);
        if (!schema) {
          return ok({
            found:      false,
            entityName,
            suggestion: `Entity not found. Call onec_search_entities with query '${entityName.split("_")[1] ?? entityName}' to discover similar names.`,
          });
        }
        return ok({
          found:          true,
          name:           schema.name,
          category:       schema.category,
          propertyCount:  schema.properties.length,
          relationCount:  schema.relations.length,
          properties:     schema.properties,
          relations:      schema.relations,
        });
      } catch (e) { return wrapError(e); }
    },
  );

  // ── onec_search_entities ───────────────────────────────────────────────────
  server.tool(
    "onec_search_entities",
    [
      "Find 1C OData entities by name fragment. Use when you know part of the entity name or want to browse a category.",
      "Returns entity name, category, and property/relation counts — no field details (call onec_get_entity_schema for that).",
      "Examples: query='Поступление' category='Document' → finds Document_ПоступлениеТоваровУслуг and related docs.",
      "          query='Склад' → finds Catalog_Склады and any entity with Склад in its name.",
      "          category='AccumulationRegister' → lists all accumulation registers.",
    ].join(" "),
    {
      query:    z.string().min(1).max(200)
        .describe("Name fragment to search for (case-insensitive, Russian or English), e.g. 'Поступление', 'Payment', 'НДС', 'Зарплата'"),
      category: CATEGORY_ENUM
        .describe("Optionally restrict to one 1C object type. Options: Catalog, Document, AccumulationRegister, InformationRegister, AccountingRegister, ChartOfAccounts, DocumentJournal"),
      limit:    z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ query, category, limit }) => {
      try {
        const results = service.searchByName(query, limit, category);
        return ok({
          found:   results.length,
          query,
          category: category ?? "all",
          results: results.map(s => ({
            name:           s.name,
            category:       s.category,
            propertyCount:  s.properties.length,
            relationCount:  s.relations.length,
          })),
        });
      } catch (e) { return wrapError(e); }
    },
  );

  // ── onec_find_field ────────────────────────────────────────────────────────
  server.tool(
    "onec_find_field",
    [
      "Find all 1C OData entities that contain a field matching the given name (case-insensitive substring match).",
      "Use to answer: 'Which entity owns the field НазначениеПлатежа?' or 'Which documents have a СуммаДокумента field?'",
      "Also useful for discovering the correct spelling of Cyrillic field names before writing OData $filter or $select clauses.",
      "Returns entity name, category, and the matching property's type and nullable flag.",
    ].join(" "),
    {
      fieldName: z.string().min(1).max(200)
        .describe("Field name or fragment to search for, e.g. 'НазначениеПлатежа', 'Контрагент_Key', 'СуммаДокумента', 'Ref_Key', 'Posted'"),
      limit:     z.number().int().min(1).max(100).optional().default(20),
    },
    async ({ fieldName, limit }) => {
      try {
        const results = service.searchByField(fieldName, limit);
        return ok({
          found:     results.length,
          fieldName,
          results:   results.map(m => ({
            entityName:    m.entityName,
            category:      m.category,
            fieldName:     m.property.name,
            fieldType:     m.property.type,
            nullable:      m.property.nullable,
          })),
        });
      } catch (e) { return wrapError(e); }
    },
  );

  // ── onec_get_entity_relations ──────────────────────────────────────────────
  server.tool(
    "onec_get_entity_relations",
    [
      "Get the full relationship graph for a 1C entity: both outbound foreign keys (fields this entity holds pointing to other entities)",
      "and inbound references (other entities that hold a foreign key pointing to this one).",
      "Use to build $expand chains: e.g. find that Document_АвансовыйОтчет has an outbound relation to Catalog_Валюты via ВалютаДокумента,",
      "so you can add '$expand=ВалютаДокумента' to an OData query.",
      "Also shows which Documents reference a given Catalog (inbound), useful for understanding data dependencies.",
    ].join(" "),
    {
      entityName: z.string().min(1).max(200)
        .describe("Exact OData entity name, e.g. 'Document_АвансовыйОтчет', 'Catalog_Контрагенты'"),
    },
    async ({ entityName }) => {
      try {
        const schema = service.getSchema(entityName);
        if (!schema) {
          return ok({
            found:      false,
            entityName,
            suggestion: `Entity not found. Use onec_search_entities to discover the correct name.`,
          });
        }
        const graph = service.getRelations(entityName);
        return ok({
          found:         true,
          entityName,
          category:      schema.category,
          outboundCount: graph.outbound.length,
          inboundCount:  graph.inbound.length,
          outbound:      graph.outbound,   // foreign keys this entity owns
          inbound:       graph.inbound,    // entities that reference this one
        });
      } catch (e) { return wrapError(e); }
    },
  );
}
