import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ReportsService, CatalogService, CashManagementService } from "@aibos/services";
import { AnswerComposer } from "../composer/AnswerComposer.js";
import { wrapError, resolveOrg } from "./utils.js";

export function registerAnswerTools(
  server: McpServer,
  reports: ReportsService,
  catalog: CatalogService,
  cash: CashManagementService,
): void {
  const composer = new AnswerComposer(reports, catalog, cash);

  server.tool(
    "onec_answer",
    [
      "PRIMARY ENTRY POINT — call this first for any accounting question before falling back to primitives.",
      "Accepts a natural-language question in Russian or English, routes it to the right 1C data source,",
      "and returns a structured answer with a provenance trail (which tools were called, which OData entity,",
      "row counts, timing) and suggested follow-up questions.",
      "Canonical patterns handled: receivables (дебиторы), payables (кредиторы), cash (касса/банк).",
      "If the answer contains 'unknown intent', fall back to onec_find_tool to discover the right primitive.",
    ].join(" "),
    {
      question: z.string().min(3).describe(
        "Natural-language accounting question in Russian or English. Examples: " +
        "'Сколько Агросиндикат нам должен?', 'What is our total receivables as of today?', 'Кредиторская задолженность на конец месяца'",
      ),
      asOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe(
        "Balance date YYYY-MM-DD. Defaults to today.",
      ),
      organizationGuid: z.string().uuid().optional().describe(
        "Organization GUID. Omit to use the server default (ONEC_DEFAULT_ORG_GUID).",
      ),
      context: z.object({
        subject: z.object({
          type: z.enum(["contractor", "employee", "asset", "doc"]),
          guid: z.string().uuid(),
          name: z.string(),
        }).optional(),
        period: z.object({
          start: z.string(),
          end: z.string(),
        }).optional(),
      }).optional().describe(
        "Carry-over context from the previous turn (subject, period). Used for follow-up questions.",
      ),
    },
    async ({ question, asOfDate, organizationGuid, context }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const date = asOfDate ?? new Date().toISOString().slice(0, 10);
        const answer = await composer.compose(question, date, org.guid, context);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(answer, null, 2),
          }],
        };
      } catch (e) {
        return wrapError(e);
      }
    },
  );
}
