import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { EsfService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerEsfTools(server: McpServer, svc: EsfService): void {
  server.tool(
    "onec_get_esf_submission_status",
    [
      "Returns ЭСФ (Electronic Tax Invoice) submission summary for the period from Document_ЭСФ.",
      "Shows: total ESF count, submitted/accepted, rejected, pending, totalAmount, totalVat (KZT), and rejectionRate %.",
      "Kazakhstan requires all VAT payers to submit ЭСФ through the IS ЭСФ portal — a high rejection rate signals data entry or format issues.",
      "Returns: EsfStatusSummary with period, counts by status, totals.",
      "Drill: call onec_get_esf_errors(periodFrom, periodTo) to see rejection reasons for each failed document.",
    ].join(" "),
    {
      periodFrom: z.string().describe("Start date YYYY-MM-DD"),
      periodTo: z.string().describe("End date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional().describe("Organization Ref_Key (optional)"),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getEsfSubmissionStatus(periodFrom, periodTo, org.guid);
        return ok(result, {
          orgGuid: org.guid,
          orgGuidCorrected: org.corrected || undefined,
          rowCount: result.total,
          note: org.corrected
            ? `organizationGuid «${org.provided}» не найден — использован дефолтный ${org.guid}`
            : undefined,
        });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_esf_errors",
    [
      "Returns all rejected ЭСФ (Electronic Tax Invoice) documents with error codes and messages for the period.",
      "For each rejected document, fetches errors from Document_ЭСФ_ЭСФ_Ошибки subtable: errorCode, errorMessage, counterpartyGuid, documentDate.",
      "Common error codes: FORMAT_ERROR (field missing), SIGNATURE_ERROR (certificate expired), DUPLICATE (already submitted), COUNTERPARTY_NOT_FOUND.",
      "Returns: errors[], total, period.",
      "Drill: fix underlying 1C document and re-submit through IS ЭСФ portal. Then re-run onec_get_esf_submission_status to verify cleared.",
    ].join(" "),
    {
      periodFrom: z.string().describe("Start date YYYY-MM-DD"),
      periodTo: z.string().describe("End date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional().describe("Organization Ref_Key (optional)"),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getEsfErrors(periodFrom, periodTo, org.guid);
        return ok(result, {
          orgGuid: org.guid,
          orgGuidCorrected: org.corrected || undefined,
          rowCount: result.total,
          note: org.corrected
            ? `organizationGuid «${org.provided}» не найден — использован дефолтный ${org.guid}`
            : undefined,
        });
      } catch (e) { return wrapError(e); }
    },
  );
}
