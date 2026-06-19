import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SetupAuditService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerSetupAuditTools(server: McpServer, svc: SetupAuditService): void {
  server.tool(
    "onec_audit_gl_account_mapping",
    [
      "Phase-0 setup audit: checks that all required Kazakhstan standard accounts (1010, 1030, 1210, 1310, 1320, 3110, 3130, 3310, 3350, 6010, 7010) exist in the 1C chart of accounts and are not marked for deletion.",
      "Run this first on any new tenant or after a chart-of-accounts migration to catch misconfiguration before transactional tools are used.",
      "Returns: totalAccountsInChart, requiredAccountsPresent[], requiredAccountsMissing[], deletedRequiredAccounts[], issues[] with severity/recommendation, and a top-level passed flag.",
      "Drill: if issues[] is non-empty, fix in 1C then re-run to confirm. Then run onec_verify_opening_balances to check period transition integrity.",
    ].join(" "),
    {
      asOfDate: z.string().describe("Reference date YYYY-MM-DD (used for logging only; chart check is date-independent)"),
      organizationGuid: z.string().uuid().optional().describe("Filter by organization Ref_Key (optional)"),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.auditGlAccountMapping(asOfDate, org.guid);
        return ok(result, {
          orgGuid: org.guid,
          orgGuidCorrected: org.corrected || undefined,
          rowCount: result.issues.length,
          note: org.corrected
            ? `organizationGuid «${org.provided}» не найден — использован дефолтный ${org.guid}`
            : undefined,
        });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_verify_opening_balances",
    [
      "Verifies that opening balances at asOfDate match the closing balances of the prior day (asOfDate − 1).",
      "A mismatch signals an unposted period-transition document, a manual GL adjustment applied mid-close, or a chart-of-accounts reclassification that was not properly carried forward.",
      "Returns: mismatches[] (accountCode, priorCloseDr/Cr, currentOpenDr/Cr, diffDr, diffCr), passed flag, maxAbsDiff in KZT.",
      "Tolerance: 0.01 KZT. Run at the start of each month-end close or after a year-end reform (реформация баланса).",
      "Drill: for each mismatch call onec_analyze_account(accountCode) to inspect the transition posting detail.",
    ].join(" "),
    {
      asOfDate: z.string().describe("First day of the period to verify, YYYY-MM-DD (e.g. first day of current month)"),
      organizationGuid: z.string().uuid().optional().describe("Organization Ref_Key; defaults to tenant default if omitted"),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.verifyOpeningBalances(asOfDate, org.guid);
        return ok(result, {
          orgGuid: org.guid,
          orgGuidCorrected: org.corrected || undefined,
          rowCount: result.mismatches.length,
          note: org.corrected
            ? `organizationGuid «${org.provided}» не найден — использован дефолтный ${org.guid}`
            : undefined,
        });
      } catch (e) { return wrapError(e); }
    },
  );
}
