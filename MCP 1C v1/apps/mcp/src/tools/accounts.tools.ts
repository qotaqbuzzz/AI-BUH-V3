import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AccountsService } from "@aibos/kz-accounts";
import { ok } from "./utils.js";

export function registerAccountsTools(server: McpServer, accounts: AccountsService): void {
  server.tool(
    "kz_chart_list_sections",
    "List all 8 top-level sections of the Kazakhstan standard chart of accounts (Типовой план счетов РК). Returns section codes (1–8), names in Russian, descriptions, and subsection count.",
    {},
    async () => ok(accounts.listSections()),
  );

  server.tool(
    "kz_chart_get_section",
    "Get a top-level section of the KZ chart of accounts with its subsections list. Codes: 1=Short-term assets, 2=Long-term assets, 3=Short-term liabilities, 4=Long-term liabilities, 5=Capital, 6=Income, 7=Expenses, 8=Production.",
    {
      code: z.string().min(1).max(1).describe("Section code '1' through '8'"),
    },
    async ({ code }) => {
      const result = accounts.getSection(code);
      if (!result) return { isError: true, content: [{ type: "text" as const, text: `Section '${code}' not found. Valid codes: 1–8.` }] };
      return ok(result);
    },
  );

  server.tool(
    "kz_chart_get_subsection",
    "Get a subsection of the KZ chart of accounts with all its account groups (4-digit codes with names and descriptions). Examples: '1000'=Cash, '1200'=Short-term receivables, '2400'=Fixed assets, '3300'=Short-term payables, '6000'=Revenue.",
    {
      code: z.string().min(4).max(4).describe("4-digit subsection code, e.g. '1000', '2400', '3300'"),
    },
    async ({ code }) => {
      const result = accounts.getSubsection(code);
      if (!result) return { isError: true, content: [{ type: "text" as const, text: `Subsection '${code}' not found.` }] };
      return ok(result);
    },
  );

  server.tool(
    "kz_chart_lookup",
    "Look up any account code in the KZ standard chart of accounts and get full details with breadcrumb path. Works at all three levels: section ('1'), subsection ('1000'), or account group ('1010'). Use this to understand what a specific 1C account code means.",
    {
      code: z.string().min(1).describe("Account code at any level: section ('1'), subsection ('1000'), or group ('1010')"),
    },
    async ({ code }) => {
      const result = accounts.lookupCode(code);
      if (!result) return { isError: true, content: [{ type: "text" as const, text: `Account code '${code}' not found in the KZ standard chart of accounts.` }] };
      return ok(result);
    },
  );

  server.tool(
    "kz_chart_search",
    "Full-text search across all account names and descriptions in the Kazakhstan standard chart of accounts. Search in Russian (e.g. 'аренд', 'дебиторская', 'запасы', 'налог'). Returns matches at section, subsection, and group level with breadcrumbs.",
    {
      query: z.string().min(1).describe("Search term in Russian, e.g. 'аренд', 'дебиторская', 'налог на добавленную'"),
      limit: z.number().int().min(1).max(50).optional().default(15).describe("Max results (default 15)"),
    },
    async ({ query, limit }) => ok(accounts.search(query, limit)),
  );
}
