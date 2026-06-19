import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ok } from "./utils.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

let _catalog: string | null = null;

function loadCatalog(overridePath?: string): string {
  if (_catalog !== null) return _catalog;
  const p = overridePath ?? resolve(__dir, "../../../../ONE_C_WORKFLOWS.md");
  try { _catalog = readFileSync(p, "utf-8"); } catch { _catalog = ""; }
  return _catalog;
}

interface SectionMatch {
  domain: string;
  sectionTitle: string;
  excerpt: string;
  relevantEntities: string[];
}

function searchCatalog(content: string, keyword: string, domain?: string): SectionMatch[] {
  const kw = keyword.toLowerCase();
  const lines = content.split("\n");
  const matches: SectionMatch[] = [];

  let currentDomain = "";
  let currentSection = "";
  let sectionLines: string[] = [];
  let inSection = false;

  const flush = () => {
    if (!inSection || sectionLines.length === 0) return;
    const text = sectionLines.join("\n");
    const domainOk = !domain || currentDomain.toLowerCase().includes(domain.toLowerCase());
    if (domainOk && text.toLowerCase().includes(kw)) {
      const entities = text.match(
        /(?:Document|Catalog|AccumulationRegister|InformationRegister|ChartOfAccounts|AccountingRegister)_[А-ЯA-Z][А-Яа-яA-Za-z0-9]*/g,
      ) ?? [];
      matches.push({
        domain: currentDomain,
        sectionTitle: currentSection,
        excerpt: text.slice(0, 600).trimEnd(),
        relevantEntities: [...new Set(entities)],
      });
    }
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flush();
      currentDomain = line.replace(/^##\s*/, "").trim();
      currentSection = currentDomain;
      sectionLines = [line];
      inSection = true;
    } else if (line.startsWith("### ")) {
      flush();
      currentSection = line.replace(/^###\s*/, "").trim();
      sectionLines = [line];
      inSection = true;
    } else {
      sectionLines.push(line);
    }
  }
  flush();

  return matches;
}

export function registerWorkflowCatalogTools(server: McpServer, catalogPath?: string): void {
  server.tool(
    "onec_search_workflow_catalog",
    [
      "Searches the 1C Kazakhstan Workflow Catalog — 117 document types, 171 registers, and 271 catalogs across 16 business domains.",
      "Use to discover OData entity names for a business concept before constructing queries.",
      "Examples: keyword='ОС' → Fixed Asset entities; keyword='НДС' → VAT documents; keyword='зарплат' → payroll.",
      "Returns: matching sections with OData entity names (Document_*, Catalog_*, InformationRegister_*, AccumulationRegister_*), domain label, and a brief excerpt.",
      "Drill: after finding an entity, call onec_get_entity_schema(entityName) to get its full OData field list.",
    ].join(" "),
    {
      keyword: z.string().min(1).describe("Search keyword — Russian or English (e.g. 'НМА', 'payroll', 'ОС', 'НДС', 'авансовый')"),
      domain: z.string().optional().describe("Filter by domain name partial match (e.g. 'Fixed', 'Payroll', 'Tax', 'Custom') — leave empty for all domains"),
      maxResults: z.number().int().min(1).max(30).optional().default(10),
    },
    async ({ keyword, domain, maxResults }) => {
      const catalog = loadCatalog(catalogPath);
      if (!catalog) return ok({ matches: [], note: "ONE_C_WORKFLOWS.md not found" });
      const matches = searchCatalog(catalog, keyword, domain).slice(0, maxResults);
      return ok({
        keyword,
        domain: domain ?? "all",
        totalMatches: matches.length,
        matches,
        hint: matches.length === 0
          ? `No matches for '${keyword}'. Try shorter terms or Russian entity names.`
          : undefined,
      });
    },
  );
}
