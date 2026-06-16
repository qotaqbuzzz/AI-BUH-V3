import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AccountAnalysisService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerAccountAnalysisTools(server: McpServer, svc: AccountAnalysisService): void {
  server.tool(
    "onec_analyze_account",
    [
      "Universal account analyser — works for ANY account code in any standard 1C database (not agro-specific).",
      "Returns five views in one call:",
      "  • summary       — opening balance, Дт/Кт turnover, closing balance for the period",
      "  • byCorrAccount — breakdown by corresponding account (корреспондирующий счёт) with % share and document types;",
      "                    shows cost routes (e.g. 8112←1310 materials, 8112←3350 payroll, 8112←8412 overhead)",
      "  • bySubconto    — closing balance split by subconto (ExtDimension1/2) with auto-resolved names",
      "  • monthlyTrend  — Дт/Кт turnover and closing balance per calendar month",
      "  • risks[]       — detected accounting errors / risks based on corr-account correspondences.",
      "                    Each risk has: severity (warn/error/critical), ruleId, corrAccount, message (RU), suggestedFix (1C steps).",
      "                    IMPORTANT: if risks[] is non-empty, you MUST show every item to the user with",
      "                    severity flag (🔴 critical, 🟠 error, 🟡 warn) and suggestedFix. Never ignore risks[].",
      "                    Examples detected: tax accounts (31xx) posted directly to equity (EQ-002);",
      "                    dividends via payroll document (EQ-001a); dividends in a loss year (EQ-001b);",
      "                    payroll/contribution accounts (32xx) posted to equity (EQ-003).",
      "Use this instead of onec_get_account_card when that tool returns empty rows (known 1C OData limitation with OR-filter on RecordType).",
    ].join(" "),
    {
      accountCode:      z.string().regex(/^\d{4}(\.\d{1,4})?$/, "Account code must be 4 digits with optional sub-account (e.g. '8110', '3310.01')").describe("Account code, e.g. '8112', '1341', '7010', '3310'"),
      dateFrom:         z.string().describe("Period start YYYY-MM-DD"),
      dateTo:           z.string().describe("Period end YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional().describe("Filter by organization Ref_Key"),
    },
    async ({ accountCode, dateFrom, dateTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.analyzeAccount(accountCode, dateFrom, dateTo, org.guid);
        return ok(result, {
          orgGuid: org.guid,
          orgGuidCorrected: org.corrected || undefined,
          orgGuidProvided: org.provided,
          note: org.corrected
            ? `organizationGuid «${org.provided}» не найден — использован дефолтный ${org.guid}`
            : undefined,
        });
      } catch (e) { return wrapError(e); }
    },
  );
}
