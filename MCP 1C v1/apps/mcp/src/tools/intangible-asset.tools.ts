import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { IntangibleAssetService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerIntangibleAssetTools(server: McpServer, svc: IntangibleAssetService): void {
  server.tool(
    "onec_get_nma_register",
    [
      "Returns the intangible asset (НМА) register as of a given date: all active NMA items from Catalog_НематериальныеАктивы with acquisition cost, useful life, amortization method, and net book value.",
      "Also cross-checks register total against GL account 2700 balance — a mismatch indicates unposted acceptance documents or manual GL adjustments.",
      "Returns: assets[], glBalance2700, registerTotal, glMismatch flag.",
      "Drill: for amortization schedule of a specific asset call onec_get_nma_amortization_schedule(assetGuid, periodFrom, periodTo).",
    ].join(" "),
    {
      asOfDate: z.string().describe("Balance date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional().describe("Organization Ref_Key (optional)"),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getNmaRegister(asOfDate, org.guid);
        return ok(result, {
          orgGuid: org.guid,
          orgGuidCorrected: org.corrected || undefined,
          rowCount: result.assets.length,
          note: org.corrected
            ? `organizationGuid «${org.provided}» не найден — использован дефолтный ${org.guid}`
            : undefined,
        });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_nma_amortization_schedule",
    [
      "Returns the monthly amortization schedule for a specific intangible asset from InformationRegister_НачислениеАмортизацииНМАБухгалтерскийУчет.",
      "Shows period, amortizationAmount, accumulated total, and remainingValue for each month in the specified range.",
      "Use after onec_get_nma_register to drill into a specific asset's amortization history.",
      "Returns: assetGuid, entries[] with period/amortizationAmount/accumulated.",
    ].join(" "),
    {
      assetGuid: z.string().uuid().describe("NMA item Ref_Key from onec_get_nma_register"),
      periodFrom: z.string().describe("Start date YYYY-MM-DD"),
      periodTo: z.string().describe("End date YYYY-MM-DD"),
    },
    async ({ assetGuid, periodFrom, periodTo }) => {
      try {
        const result = await svc.getNmaAmortizationSchedule(assetGuid, periodFrom, periodTo);
        return ok(result, { rowCount: result.entries.length });
      } catch (e) { return wrapError(e); }
    },
  );
}
