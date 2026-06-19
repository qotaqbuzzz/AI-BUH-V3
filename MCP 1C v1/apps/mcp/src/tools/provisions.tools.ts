import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ProvisionService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerProvisionTools(server: McpServer, svc: ProvisionService): void {
  server.tool(
    "onec_get_provision_register",
    "Returns all active provisions from Catalog_РезервыПредстоящихРасходов (if it exists) cross-validated against GL balances on accounts 3520 (warranty/litigation provisions) and 3530 (restructuring provisions). Returns totalProvisions, glTotal, and a mismatch flag. If no provision catalog exists, returns GL balances as the ground truth. Drill: call onec_validate_provision_adequacy to check coverage ratios.",
    {
      asOfDate: z.string().describe("Balance date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getProvisionRegister(asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.provisions.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_provision_adequacy",
    "Checks that each provision's amount covers 100% of its stated exposure (Экспозиция). Underfunded provisions have coverage < 100% and represent potential unrecognized liabilities. Returns passed flag, list of underfunded provisions, total shortfall, and recommendations. Run before annual audit or IFRS reporting. Drill: for each underfunded provision, call onec_get_account_card('3520'/'3530', ...) to review posting history.",
    {
      asOfDate: z.string().describe("Balance date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.validateProvisionAdequacy(asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );
}
