/**
 * EntitySchemaService — offline 1C entity schema browser.
 *
 * Reads the Entities/ folder (889 Markdown files exported from 1C:Бухгалтерия KZ)
 * and builds an in-memory index of every OData entity's properties and relations.
 *
 * Structure of each .md file:
 *   - YAML frontmatter: category, properties count, relations count
 *   - ## Properties: markdown table (Name | Type | Nullable)
 *   - ## Related Entities: Obsidian wiki-links  [[TargetEntity]] — FieldName
 *
 * Usage:
 *   const svc = new EntitySchemaService("/abs/path/to/Entities");
 *   const schema = svc.getSchema("Document_АвансовыйОтчет"); // 42 properties
 *   const matches = svc.searchByField("НазначениеПлатежа");  // which entities own this field?
 */

import { readFileSync, readdirSync } from "fs";
import { join, basename } from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export interface EntityProperty {
  /** OData field name (may be Cyrillic, e.g. "НазначениеПлатежа" or "Ref_Key") */
  name:     string;
  /** Edm type, e.g. "Edm.Guid", "Edm.String", "Edm.Double", "Edm.Boolean", "Edm.DateTime", "Edm.Int64" */
  type:     string;
  /** Whether the field is nullable in OData */
  nullable: boolean;
}

export interface EntityRelation {
  /** 1C entity this relation points to, e.g. "Catalog_Контрагенты" */
  targetEntity: string;
  /** Logical name of the foreign-key field (without _Key suffix), e.g. "Контрагент" */
  fieldName:    string;
}

export interface EntitySchema {
  /** Full entity name as used in OData, e.g. "Document_АвансовыйОтчет" */
  name:       string;
  /** 1C object category: "Catalog" | "Document" | "AccumulationRegister" | "InformationRegister" | "AccountingRegister" | "ChartOfAccounts" | "ChartOfCalculationTypes" | "ChartOfCharacteristicTypes" | "DocumentJournal" */
  category:   string;
  properties: EntityProperty[];
  relations:  EntityRelation[];
}

export interface FieldMatch {
  entityName: string;
  category:   string;
  property:   EntityProperty;
}

export interface RelationGraph {
  /** Relations pointing OUT from this entity to others */
  outbound: EntityRelation[];
  /** Entities that hold a foreign key pointing TO this entity */
  inbound:  Array<{ from: string; field: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Parser helpers
// ─────────────────────────────────────────────────────────────────────────────

// Matches:  - [[Catalog_Контрагенты]] — Контрагент
// The separator can be an em-dash (—, U+2014) or ASCII dash (-).
const RELATION_RE = /\[\[([^\]]+)\]\]\s*[—\-]+\s*(.+)/;

function parseFile(filePath: string): EntitySchema | null {
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }

  const name  = basename(filePath, ".md");
  const lines = content.split(/\r?\n/);

  // ── Category from YAML frontmatter ─────────────────────────────────────────
  let category = "";
  for (const line of lines) {
    const m = line.match(/^category:\s*(.+)/);
    if (m) { category = m[1].trim(); break; }
  }

  // ── Properties table ────────────────────────────────────────────────────────
  // Layout inside the .md:
  //   ## Properties
  //   | Name | Type | Nullable |
  //   |------|------|----------|   ← separator row
  //   | Ref_Key | Edm.Guid | false |
  const properties: EntityProperty[] = [];
  let inProps    = false;
  let pastHeader = false; // true once we've seen the separator row

  for (const line of lines) {
    if (line.startsWith("## Properties")) { inProps = true; pastHeader = false; continue; }
    if (inProps) {
      if (line.startsWith("## ")) { inProps = false; continue; }
      if (!line.trim().startsWith("|")) continue;
      if (!pastHeader) {
        // First non-separator `|` row → column headers; separator row sets pastHeader
        if (line.includes("---")) pastHeader = true;
        continue; // skip both header and separator rows
      }
      const cells = line.split("|").map(c => c.trim()).filter(Boolean);
      if (cells.length >= 3) {
        properties.push({
          name:     cells[0]!,
          type:     cells[1]!,
          nullable: cells[2]!.toLowerCase() === "true",
        });
      }
    }
  }

  // ── Related Entities ────────────────────────────────────────────────────────
  const relations: EntityRelation[] = [];
  let inRelations = false;

  for (const line of lines) {
    if (line.startsWith("## Related Entities")) { inRelations = true; continue; }
    if (inRelations) {
      if (line.startsWith("## ")) { inRelations = false; continue; }
      const m = line.match(RELATION_RE);
      if (m) {
        relations.push({
          targetEntity: m[1]!.trim(),
          fieldName:    m[2]!.trim(),
        });
      }
    }
  }

  return { name, category, properties, relations };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export class EntitySchemaService {
  /** Primary index: entity name → schema */
  private readonly schemas  = new Map<string, EntitySchema>();

  /** Reverse field index: field name (lower-cased) → list of entity names */
  private readonly byField  = new Map<string, string[]>();

  /** Reverse relation index: target entity name → list of {from, field} */
  private readonly inbound  = new Map<string, Array<{ from: string; field: string }>>();

  constructor(private readonly entitiesDir: string) {
    if (!entitiesDir) {
      console.warn("[EntitySchemaService] entitiesDir not configured — schema tools disabled.");
      return;
    }
    try {
      this.buildIndex(entitiesDir);
      console.error(
        `[EntitySchemaService] Indexed ${this.schemas.size} entities from ${entitiesDir}`,
      );
    } catch (err) {
      console.warn(
        `[EntitySchemaService] Could not build index from "${entitiesDir}": ` +
        (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  // ── Index builder ──────────────────────────────────────────────────────────

  private buildIndex(dir: string): void {
    let subdirs: string[];
    try {
      subdirs = readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => join(dir, d.name));
    } catch {
      // dir doesn't exist or isn't readable
      return;
    }

    for (const subdir of subdirs) {
      let files: string[];
      try {
        files = readdirSync(subdir)
          .filter(f => f.endsWith(".md"))
          .map(f => join(subdir, f));
      } catch {
        continue;
      }

      for (const filePath of files) {
        const schema = parseFile(filePath);
        if (!schema) continue;

        this.schemas.set(schema.name, schema);

        // Build field index (lower-cased for case-insensitive search)
        for (const prop of schema.properties) {
          const key = prop.name.toLowerCase();
          const list = this.byField.get(key) ?? [];
          list.push(schema.name);
          this.byField.set(key, list);
        }

        // Build inbound relation index
        for (const rel of schema.relations) {
          const list = this.inbound.get(rel.targetEntity) ?? [];
          list.push({ from: schema.name, field: rel.fieldName });
          this.inbound.set(rel.targetEntity, list);
        }
      }
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Exact lookup by entity name (case-sensitive, as in OData).
   * Returns null if the entity is not in the index.
   */
  getSchema(entityName: string): EntitySchema | null {
    return this.schemas.get(entityName) ?? null;
  }

  /**
   * Search for entities whose name contains `query` (case-insensitive).
   * Optionally filter by `category`.
   */
  searchByName(query: string, limit = 20, category?: string): EntitySchema[] {
    const q       = query.toLowerCase();
    const results: EntitySchema[] = [];

    for (const schema of this.schemas.values()) {
      if (!schema.name.toLowerCase().includes(q)) continue;
      if (category && schema.category !== category)  continue;
      results.push(schema);
      if (results.length >= limit) break;
    }
    return results;
  }

  /**
   * Find all entities that contain a property whose name includes `fieldName`
   * (case-insensitive substring match).
   */
  searchByField(fieldName: string, limit = 20): FieldMatch[] {
    const q       = fieldName.toLowerCase();
    const results: FieldMatch[] = [];

    // First try exact key in byField for performance
    const exactList = this.byField.get(q);
    if (exactList) {
      for (const entityName of exactList) {
        const schema = this.schemas.get(entityName)!;
        const prop   = schema.properties.find(p => p.name.toLowerCase() === q)!;
        results.push({ entityName, category: schema.category, property: prop });
        if (results.length >= limit) return results;
      }
    }

    // Substring fallback for partial matches
    if (results.length < limit) {
      for (const [key, names] of this.byField) {
        if (key === q) continue; // already handled above
        if (!key.includes(q))   continue;
        for (const entityName of names) {
          const schema = this.schemas.get(entityName)!;
          const prop   = schema.properties.find(p => p.name.toLowerCase() === key)!;
          results.push({ entityName, category: schema.category, property: prop });
          if (results.length >= limit) return results;
        }
      }
    }

    return results;
  }

  /**
   * Returns the outbound relations of an entity (foreign keys pointing out)
   * plus the inbound relations (other entities whose foreign keys point to this one).
   */
  getRelations(entityName: string): RelationGraph {
    return {
      outbound: this.schemas.get(entityName)?.relations ?? [],
      inbound:  this.inbound.get(entityName) ?? [],
    };
  }

  /**
   * List all entity names in alphabetical order.
   * Pass `category` to filter to a specific 1C object type.
   */
  listEntities(category?: string): string[] {
    const names: string[] = [];
    for (const [name, schema] of this.schemas) {
      if (!category || schema.category === category) names.push(name);
    }
    return names.sort();
  }

  /** Number of entities successfully indexed. */
  get size(): number { return this.schemas.size; }

  /** Whether the service has a non-empty index (entitiesDir was valid). */
  get isAvailable(): boolean { return this.schemas.size > 0; }
}
