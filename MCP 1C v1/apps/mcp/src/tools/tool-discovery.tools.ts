import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ToolDiscoveryService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerToolDiscoveryTools(server: McpServer, svc: ToolDiscoveryService): void {
  server.tool(
    "onec_find_tool",
    [
      "ROUTING TOOL — call this FIRST for any 1C Kazakhstan accounting task to find the right specialized tool(s) before guessing a name.",
      `Searches ${svc.toolCount()} specialized tools (cash, payroll, ОС/НМА, ЭСФ, НДС, КПН, consolidation, audit, validation, etc.) by keyword, GL account, entity name, verb, or workflow.`,
      "Accepts Russian or English: 'cash position end of May', 'зарплата за май', 'НДС за 2 квартал', 'ОС амортизация', 'month close'.",
      "Returns ranked tool matches with usage hints, plus an optional named workflow (e.g. month_close, vat_filing, payroll_close) when the query matches one of the catalogued multi-step processes.",
      "Optional filters: persona='accountant'|'auditor'|'controller'|'hr'|'cfo' to focus role-specific tools; domain to constrain to a single functional area (cash, payroll, tax-filing, fixed-asset, validation-*, etc.).",
      "After receiving results, call the recommended tool directly with its real parameters. Skip this only when the user already named a specific onec_* tool.",
    ].join(" "),
    {
      query: z.string().min(2).describe("Natural-language intent in Russian or English (e.g. 'check VAT compliance', 'зарплата за май', 'fixed asset depreciation', 'month close'). Pass 'list domains' to enumerate available domain filters and workflow IDs."),
      persona: z.enum(["accountant", "auditor", "controller", "hr", "cfo"]).optional().describe("Filter tools relevant to this role."),
      domain: z.string().optional().describe("Optional domain filter — e.g. cash, payroll, tax-filing, fixed-asset."),
      maxResults: z.number().int().min(1).max(15).optional().default(5).describe("How many tools to return (default 5)."),
    },
    async ({ query, persona, domain, maxResults }) => {
      try {
        if (query.trim().toLowerCase() === "list domains") {
          return ok({ domains: svc.listDomains(), workflows: svc.listWorkflows(), totalTools: svc.toolCount() });
        }
        const result = svc.find(query, { persona, domain });
        return ok({
          workflow:     result.workflow,
          topTools:     result.topTools.slice(0, maxResults),
          totalScanned: result.totalScanned,
        });
      } catch (e) { return wrapError(e); }
    },
  );
}
