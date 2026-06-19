/**
 * ToolDiscoveryService — keyword + weighted scoring router.
 *
 * Loads the tool-registry.json built by scripts/build-tool-registry.ts and a
 * workflows.json catalog of named multi-step processes. Given a natural-language
 * query (RU or EN), returns the top-N matching tools plus an optional workflow.
 *
 * Scoring formula (per tool):
 *   +20 query keyword matches tool keyword
 *   +15 query verb matches tool verb (get/drill/validate/analyze/calculate/search)
 *   +10 query mentions domain
 *   +8  persona filter matches
 *   +5  per GL account match
 *   +3  per entity match
 *   +2  per fuzzy substring hit in shortDescription
 *   -10 persona filter set and tool persona does not include it
 *   -5  domain filter set and tool domain does not match
 */

import { readFileSync } from "node:fs";

export interface ToolMetadata {
  name:             string;
  description:      string;
  shortDescription: string;
  domain:           string;
  verb:             string;
  keywords:         string[];
  glAccounts:       string[];
  entities:         string[];
  drillsTo:         string[];
  persona:          string[];
}

export interface Workflow {
  id:          string;
  name:        string;
  description: string;
  keywords:    string[];
  persona:     string[];
  steps:       { tool: string; purpose: string }[];
}

export interface ToolMatch {
  name:             string;
  score:            number;
  shortDescription: string;
  hint:             string;
  matchReason:      string[];
}

export interface DiscoveryFilters {
  persona?: string;
  domain?:  string;
}

export interface DiscoveryResult {
  workflow:     Workflow | null;
  topTools:     ToolMatch[];
  totalScanned: number;
}

const VERBS = new Set(["get", "drill", "validate", "analyze", "calculate", "search", "find", "audit", "verify", "scan", "investigate", "generate", "forecast", "build", "post", "create", "resolve"]);

// Concept → aliases (RU + EN). Tool keywords in the registry are stored as canonical
// concept names (e.g. "payroll"), so we expand a user query through this lexicon
// to inject the concept name whenever any alias matches — that's what makes
// "зарплата за май" actually find tools tagged with the "payroll" keyword.
// Mirrors the LEXICON in scripts/build-tool-registry.ts.
const LEXICON: Record<string, string[]> = {
  cash:       ["касса", "касс", "cash", "деньги", "наличн", "1010"],
  bank:       ["банк", "bank", "1030", "расчётн", "расчетн"],
  forex:      ["валют", "forex", "currency", "exchange", "курс"],
  fa:         ["ос ", " ос", "основн", "fixed asset", "fixed-asset", "амортизац", "2410", "2420"],
  nma:        ["нма", "intangible", "нематериальн", "2700"],
  vat:        ["ндс", "vat", "эсф", "esf", "3130"],
  esf:        ["эсф", "esf", "электронн", "tax invoice"],
  ipn:        ["ипн", "ipn", "income tax", "withholding"],
  opv:        ["опв", "opv", "pension", "пенсион", "3220"],
  so:         ["со ", "социаль", "social insurance", "3210"],
  vosms:      ["восмс", "осмс", "medical", "медицин"],
  kpn:        ["кпн", "kpn", "corporate tax", "прибыл", "3110"],
  sn:         ["соц.налог", "сн ", "social tax", "3150"],
  payroll:    ["зарплат", "salary", "payroll", "wage", "3350", "начислен", "фот"],
  hr:         ["сотрудник", "employee", "headcount", "штат", "найм", "увольн", "работник"],
  ar:         ["дебитор", "receivable", "1210", "должник"],
  ap:         ["кредитор", "payable", "3310", "поставщик"],
  inventory:  ["товар", "inventory", "stock", "склад", "запас", "1310", "1320", "номенклатур"],
  cogs:       ["себестоим", "cogs", "7010"],
  revenue:    ["выручк", "доход", "revenue", "income", "продаж", "6010", "реализац"],
  expense:    ["расход", "expense", "затрат", "7210", "8110"],
  budget:     ["бюджет", "budget", "forecast", "план"],
  consolidation: ["консолидац", "consolidat", "elimination", "межоргани"],
  customs:    ["таможн", "customs", "гтд", "import", "импорт"],
  audit:      ["аудит", "audit", "проверк", "compliance", "соответств"],
  close:      ["закрыт", "close", "month-end", "период"],
  validate:   ["проверк", "validat", "verify", "check"],
  drill:      ["детал", "drill", "разбивк", "breakdown"],
  schema:     ["схем", "metadata", "entit", "поле"],
  workflow:   ["workflow", "process", "процесс"],
  asset_transfer: ["передач", "transfer", "перемещ"],
  related_party:  ["связан", "related party", "rpt"],
  provision:  ["резерв", "provision"],
  setup:      ["настройк", "setup", "initial", "configuration", "конфигурац"],
  cost_center: ["подразделен", "cost center", "centre", "department"],
};

export class ToolDiscoveryService {
  private readonly toolsByName  = new Map<string, ToolMetadata>();
  private readonly toolsByVerb  = new Map<string, string[]>();
  private readonly toolsByDomain = new Map<string, string[]>();
  private readonly workflows: Workflow[] = [];

  constructor(toolRegistryPath: string, workflowsPath: string) {
    this.loadTools(toolRegistryPath);
    this.loadWorkflows(workflowsPath);
  }

  private loadTools(path: string): void {
    const raw = readFileSync(path, "utf-8");
    const tools: ToolMetadata[] = JSON.parse(raw);
    for (const t of tools) {
      this.toolsByName.set(t.name, t);
      if (!this.toolsByVerb.has(t.verb)) this.toolsByVerb.set(t.verb, []);
      this.toolsByVerb.get(t.verb)!.push(t.name);
      if (!this.toolsByDomain.has(t.domain)) this.toolsByDomain.set(t.domain, []);
      this.toolsByDomain.get(t.domain)!.push(t.name);
    }
  }

  private loadWorkflows(path: string): void {
    const raw = readFileSync(path, "utf-8");
    const wfs: Workflow[] = JSON.parse(raw);
    this.workflows.push(...wfs);
  }

  toolCount():     number { return this.toolsByName.size; }
  workflowCount(): number { return this.workflows.length; }
  listDomains():   string[] { return [...this.toolsByDomain.keys()].sort(); }
  listWorkflows(): { id: string; name: string }[] {
    return this.workflows.map(w => ({ id: w.id, name: w.name }));
  }

  find(query: string, filters: DiscoveryFilters = {}): DiscoveryResult {
    const normalized = this.normalize(query);
    const workflow   = this.matchWorkflow(normalized, filters);
    const topTools   = this.scoreTools(normalized, filters);
    return { workflow, topTools, totalScanned: this.toolsByName.size };
  }

  private normalize(query: string): string {
    let q = query.toLowerCase().trim();
    q = q.replace(/ё/g, "е");
    // For every concept whose alias appears in the query, inject the canonical
    // concept name so it lines up with the tool keywords stored in the registry.
    const concepts: string[] = [];
    for (const [concept, aliases] of Object.entries(LEXICON)) {
      for (const alias of aliases) {
        if (q.includes(alias.toLowerCase())) {
          concepts.push(concept);
          break;
        }
      }
    }
    return [q, ...concepts].join(" ");
  }

  private matchWorkflow(normalized: string, filters: DiscoveryFilters): Workflow | null {
    let best: { wf: Workflow; score: number } | null = null;
    for (const wf of this.workflows) {
      let score = 0;
      for (const kw of wf.keywords) {
        if (normalized.includes(kw.toLowerCase())) score += 10;
      }
      if (filters.persona && wf.persona.includes(filters.persona)) score += 5;
      if (filters.persona && !wf.persona.includes(filters.persona)) score -= 5;
      if (score >= 10 && (best === null || score > best.score)) best = { wf, score };
    }
    return best ? best.wf : null;
  }

  private scoreTools(normalized: string, filters: DiscoveryFilters): ToolMatch[] {
    const queryTokens = new Set(normalized.split(/\s+/).filter(t => t.length >= 2));
    const matches: ToolMatch[] = [];

    for (const t of this.toolsByName.values()) {
      let score = 0;
      const reasons: string[] = [];

      for (const kw of t.keywords) {
        if (normalized.includes(kw.toLowerCase())) {
          score += 20;
          reasons.push(`keyword:${kw}`);
        }
      }

      for (const tok of queryTokens) {
        if (VERBS.has(tok) && tok === t.verb) {
          score += 15;
          reasons.push(`verb:${tok}`);
          break;
        }
      }

      if (t.domain && normalized.includes(t.domain.replace(/-/g, " "))) {
        score += 10;
        reasons.push(`domain:${t.domain}`);
      }

      if (filters.persona) {
        if (t.persona.includes(filters.persona)) {
          score += 8;
          reasons.push(`persona:${filters.persona}`);
        } else {
          score -= 10;
        }
      }

      if (filters.domain) {
        if (t.domain === filters.domain) {
          score += 5;
          reasons.push(`domain-filter:${filters.domain}`);
        } else {
          score -= 5;
        }
      }

      for (const gl of t.glAccounts) {
        if (normalized.includes(gl)) {
          score += 5;
          reasons.push(`gl:${gl}`);
        }
      }

      for (const ent of t.entities) {
        if (normalized.includes(ent.toLowerCase())) {
          score += 3;
          reasons.push(`entity:${ent}`);
        }
      }

      const shortLower = t.shortDescription.toLowerCase();
      let fuzzyHits = 0;
      for (const tok of queryTokens) {
        if (tok.length >= 3 && shortLower.includes(tok)) fuzzyHits++;
      }
      if (fuzzyHits > 0) {
        score += fuzzyHits * 2;
        reasons.push(`fuzzy:${fuzzyHits}`);
      }

      if (score > 0) {
        matches.push({
          name:             t.name,
          score,
          shortDescription: t.shortDescription,
          hint:             this.buildHint(t),
          matchReason:      reasons,
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches;
  }

  private buildHint(t: ToolMetadata): string {
    if (t.verb === "get")      return "Summary tool — call first, then drill if you need detail.";
    if (t.verb === "drill")    return "Detail tool — use after a get_* call to expand a row.";
    if (t.verb === "validate") return "Validation gate — returns passed/issues; pair with a drill tool if issues exist.";
    if (t.verb === "analyze")  return "Analytical computation — returns variance / breakdown / driver tables.";
    if (t.verb === "calculate") return "Computation — returns derived numbers (taxes, eliminations, landed cost).";
    if (t.verb === "search")   return "Catalog search — fuzzy lookup against 1C reference data.";
    if (t.verb === "audit")    return "Audit roll-up — multi-check summary; expect findings list.";
    if (t.verb === "verify")   return "Verification check — returns boolean + supporting numbers.";
    if (t.verb === "find")     return "Investigation tool — surfaces anomalies or duplicates.";
    return "See description for usage.";
  }
}
