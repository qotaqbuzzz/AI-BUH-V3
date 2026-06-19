import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AssetTransferService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerAssetTransferTools(server: McpServer, svc: AssetTransferService): void {
  server.tool(
    "onec_get_fa_transfers",
    [
      "Returns all fixed asset (ОС) inter-department and inter-organization transfer documents (Document_ПередачаОС) in the given period.",
      "Each record shows: documentNumber, documentDate, assetGuid, fromDepartment, toDepartment, fromOrgGuid, toOrgGuid, amount.",
      "Use to audit asset movements, detect unauthorized transfers, or reconcile asset location registers.",
      "Returns: transfers[], totalTransferred KZT, period.",
      "Drill: call onec_get_asset_location_audit to compare registered vs. actual locations for all assets.",
    ].join(" "),
    {
      periodFrom: z.string().describe("Start date YYYY-MM-DD"),
      periodTo: z.string().describe("End date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional().describe("Source organization Ref_Key (optional)"),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getFaTransfers(periodFrom, periodTo, org.guid);
        return ok(result, {
          orgGuid: org.guid,
          orgGuidCorrected: org.corrected || undefined,
          rowCount: result.transfers.length,
          note: org.corrected
            ? `organizationGuid «${org.provided}» не найден — использован дефолтный ${org.guid}`
            : undefined,
        });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_nma_transfers",
    [
      "Returns all intangible asset (НМА) transfer documents (Document_ПередачаНМА) in the given period.",
      "Each record shows: documentNumber, documentDate, assetGuid (НМА Ref_Key), fromOrgGuid, amount.",
      "Use to audit NMA disposals and transfers to external parties.",
      "Returns: transfers[], totalTransferred KZT, period.",
      "Drill: call onec_get_nma_register to see the current NMA register after transfers.",
    ].join(" "),
    {
      periodFrom: z.string().describe("Start date YYYY-MM-DD"),
      periodTo: z.string().describe("End date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional().describe("Organization Ref_Key (optional)"),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getNmaTransfers(periodFrom, periodTo, org.guid);
        return ok(result, {
          orgGuid: org.guid,
          orgGuidCorrected: org.corrected || undefined,
          rowCount: result.transfers.length,
          note: org.corrected
            ? `organizationGuid «${org.provided}» не найден — использован дефолтный ${org.guid}`
            : undefined,
        });
      } catch (e) { return wrapError(e); }
    },
  );
}
