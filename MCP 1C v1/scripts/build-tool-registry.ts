#!/usr/bin/env tsx
/**
 * Build script: scans apps/mcp/src/tools/*.ts and emits apps/mcp/src/data/tool-registry.json.
 * Runs at build time. Output is committed for reproducibility.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, "..");
const TOOLS_DIR = resolve(ROOT, "apps/mcp/src/tools");
const OUTPUT_DIR = resolve(ROOT, "apps/mcp/src/data");
const OUTPUT = resolve(OUTPUT_DIR, "tool-registry.json");

interface ToolMetadata {
  name: string;
  description: string;
  shortDescription: string;
  domain: string;
  verb: string;
  keywords: string[];
  glAccounts: string[];
  entities: string[];
  drillsTo: string[];
  persona: string[];
}

// Curated keyword lexicon — maps canonical concept → all aliases (RU + EN)
const LEXICON: Record<string, string[]> = {
  cash:       ["касса", "cash", "касс", "деньги", "наличн", "1010"],
  bank:       ["банк", "bank", "1030", "расчётн"],
  forex:      ["валют", "forex", "currency", "exchange", "курс"],
  fa:         ["ОС", "основн", "fixed asset", "амортизац", "2410", "2420"],
  nma:        ["НМА", "intangible", "нематериальн", "2700"],
  vat:        ["НДС", "vat", "ЭСФ", "esf", "3130"],
  esf:        ["ЭСФ", "esf", "электронн.*счёт", "tax invoice"],
  ipn:        ["ИПН", "ipn", "income tax", "withholding"],
  opv:        ["ОПВ", "opv", "pension", "пенсион", "3220"],
  so:         ["СО ", "социаль", "social insurance", "3210"],
  vosms:      ["ВОСМС", "ОСМС", "medical", "медицин"],
  kpn:        ["КПН", "kpn", "corporate tax", "налог.*прибыл", "3110"],
  sn:         ["соц.*налог", "СН ", "social tax", "3150"],
  payroll:    ["зарплат", "salary", "payroll", "wage", "3350", "начислен"],
  hr:         ["сотрудник", "employee", "headcount", "штат", "найм", "увольн"],
  ar:         ["дебитор", "receivable", "1210", "должник"],
  ap:         ["кредитор", "payable", "3310", "поставщик"],
  inventory:  ["товар", "inventory", "stock", "склад", "запас", "1310", "1320", "номенклатур"],
  cogs:       ["себестоим", "cogs", "7010"],
  revenue:    ["выручк", "доход", "revenue", "income", "продаж", "6010", "реализац"],
  expense:    ["расход", "expense", "затрат", "7210", "8110"],
  budget:     ["бюджет", "budget", "forecast", "план"],
  consolidation: ["консолидац", "consolidat", "elimination", "межоргани"],
  customs:    ["таможн", "customs", "ГТД", "import", "импорт"],
  audit:      ["аудит", "audit", "проверк", "compliance", "соответств"],
  close:      ["закрыт", "close", "month-end", "период"],
  validate:   ["проверк", "validat", "verify", "check"],
  drill:      ["детал", "drill", "разбивк", "breakdown"],
  schema:     ["схем", "metadata", "entit", "поле"],
  workflow:   ["workflow", "process", "процесс"],
  asset_transfer: ["передач", "transfer", "перемещ"],
  related_party:  ["связан", "related party", "RPT", "rpt"],
  provision:  ["резерв", "provision"],
  setup:      ["настройк", "setup", "initial", "configuration", "конфигурац"],
  cost_center: ["подразделен", "cost center", "centre", "department"],
};

// Persona heuristics from concepts
const PERSONA_MAP: Record<string, string[]> = {
  accountant: ["cash", "bank", "fa", "nma", "vat", "ar", "ap", "inventory", "payroll", "ipn", "opv", "so", "vosms", "kpn", "sn", "cogs", "revenue", "expense", "close"],
  auditor:    ["audit", "validate", "drill", "esf", "consolidation", "related_party", "provision", "setup"],
  controller: ["budget", "forecast", "consolidation", "cost_center", "kpn", "revenue", "expense"],
  hr:         ["payroll", "hr"],
  cfo:        ["budget", "forecast", "revenue", "expense", "cost_center", "kpn"],
};

function loadFiles(): string[] {
  return readdirSync(TOOLS_DIR).filter(f => f.endsWith(".tools.ts"));
}

/** Extract the description payload that sits between the tool name and the zod schema.
 *  Walks the source as TypeScript: tracks string / template / bracket / paren state so a
 *  comma inside the description text or a `[ ... ].join("..")` array does not get mistaken
 *  for the comma that separates the description from the zod schema object. */
function extractDescriptionPayload(content: string, startPos: number): string | null {
  let i = startPos;
  while (i < content.length && /\s/.test(content[i])) i++;
  const descStart = i;

  let inString: string | null = null;     // '"' | "'" | "`"
  let bracketDepth = 0;
  let parenDepth = 0;

  while (i < content.length) {
    const ch = content[i];

    if (inString) {
      if (ch === "\\") { i += 2; continue; }
      if (ch === inString) inString = null;
      i++;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") { inString = ch; i++; continue; }
    if (ch === "[") { bracketDepth++; i++; continue; }
    if (ch === "]") { bracketDepth--; i++; continue; }
    if (ch === "(") { parenDepth++; i++; continue; }
    if (ch === ")") { parenDepth--; i++; continue; }

    // A `{` at the top level marks the start of the zod schema object.
    if (ch === "{" && bracketDepth === 0 && parenDepth === 0) {
      let end = i - 1;
      while (end > descStart && /\s/.test(content[end])) end--;
      if (content[end] === ",") end--;
      const payload = content.slice(descStart, end + 1).trim();
      return payload.length > 0 ? payload : null;
    }

    i++;
  }

  return null;
}

function parseDescriptionPayload(payload: string): string {
  // Case 1: array-join — [ "...", "...", ].join("...")
  if (payload.startsWith("[")) {
    const inner = payload.match(/\[([\s\S]*?)\]\.join\(\s*"([^"]*)"\s*\)/);
    if (inner) {
      const joiner = inner[2];
      const parts = [...inner[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
      return parts.join(joiner);
    }
  }
  // Case 2: single-string — "..."
  const single = payload.match(/^"((?:[^"\\]|\\.)*)"$/s);
  if (single) return single[1];
  // Case 3: concatenation or other — extract all string literals and join
  const all = [...payload.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
  return all.join(" ");
}

function inferKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const hits = new Set<string>();
  for (const [concept, aliases] of Object.entries(LEXICON)) {
    for (const a of aliases) {
      if (lower.includes(a.toLowerCase())) {
        hits.add(concept);
        break;
      }
    }
  }
  return [...hits];
}

function inferPersona(keywords: string[]): string[] {
  const personas = new Set<string>();
  for (const [persona, concepts] of Object.entries(PERSONA_MAP)) {
    if (concepts.some(c => keywords.includes(c))) personas.add(persona);
  }
  if (personas.size === 0) personas.add("accountant");
  return [...personas];
}

function extractGlAccounts(text: string): string[] {
  const matches = [...text.matchAll(/\b([1-8][0-9]{3})\b/g)].map(m => m[1]);
  return [...new Set(matches)];
}

function extractEntities(text: string): string[] {
  const re = /(Document|Catalog|InformationRegister|AccumulationRegister|ChartOfAccounts|AccountingRegister|DocumentJournal)_[А-ЯA-Z][А-Яа-яA-Za-z0-9]*/g;
  return [...new Set([...text.matchAll(re)].map(m => m[0]))];
}

function extractDrillTargets(description: string): string[] {
  const targets = new Set<string>();
  // Match "Drill: call onec_xxx" or "call onec_xxx" or "see onec_xxx" patterns
  const re = /\b(onec_[a-z_]+|kz_[a-z_]+)\b/g;
  for (const m of description.matchAll(re)) {
    targets.add(m[1]);
  }
  return [...targets];
}

function deriveVerb(name: string): string {
  const parts = name.split("_");
  return parts[1] ?? "unknown";
}

function deriveDomain(filename: string): string {
  return basename(filename, ".tools.ts");
}

function buildShort(description: string): string {
  const firstSentence = description.split(/(?<=\.)\s+/)[0];
  return firstSentence.length > 200 ? firstSentence.slice(0, 197) + "..." : firstSentence;
}

function buildRegistry(): ToolMetadata[] {
  const files = loadFiles();
  const tools: ToolMetadata[] = [];

  for (const file of files) {
    const content = readFileSync(resolve(TOOLS_DIR, file), "utf-8");
    const domain = deriveDomain(file);

    // Find every tool name registration; iterate by matching server.tool( "name"
    const nameRe = /server\.tool\(\s*"([a-z][a-z_0-9]*)"\s*,/gm;
    let m: RegExpExecArray | null;
    while ((m = nameRe.exec(content)) !== null) {
      const name = m[1];
      const nameEnd = m.index + m[0].length;
      const payload = extractDescriptionPayload(content, nameEnd);
      if (!payload) continue;

      const description = parseDescriptionPayload(payload);
      if (!description) continue;

      const keywords = inferKeywords(description + " " + name);
      const ownName = name;
      const drillsAll = extractDrillTargets(description);
      const drillsTo = drillsAll.filter(t => t !== ownName);

      tools.push({
        name,
        description,
        shortDescription: buildShort(description),
        domain,
        verb: deriveVerb(name),
        keywords,
        glAccounts: extractGlAccounts(description),
        entities: extractEntities(description),
        drillsTo,
        persona: inferPersona(keywords),
      });
    }
  }

  return tools;
}

function main(): void {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  const tools = buildRegistry();
  writeFileSync(OUTPUT, JSON.stringify(tools, null, 2), "utf-8");
  // eslint-disable-next-line no-console
  console.log(`Generated registry: ${tools.length} tools → ${OUTPUT}`);
}

main();
