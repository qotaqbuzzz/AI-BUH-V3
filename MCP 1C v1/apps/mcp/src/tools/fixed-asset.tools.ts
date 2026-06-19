import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { FixedAssetService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerFixedAssetTools(server: McpServer, svc: FixedAssetService): void {
  server.tool(
    "onec_get_fixed_asset_register",
    "Returns the full fixed asset register from Catalog_ОсновныеСредства with acquisition cost, useful life, depreciation method, and location. Cross-validates register total against GL accounts 2410/2420 (tolerance 0.01 KZT) and returns a glMismatch flag. Drill: call onec_get_depreciation_schedule(assetGuid) for per-asset amortization or onec_get_account_card('2410', ...) to trace individual postings.",
    {
      asOfDate: z.string().describe("Balance as-of date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
      departmentGuid: z.string().uuid().optional().describe("Filter by department Ref_Key"),
      status: z.string().optional().describe("Filter by asset status, e.g. 'active', 'disposed'"),
    },
    async ({ asOfDate, organizationGuid, departmentGuid, status }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getFixedAssetRegister(asOfDate, org.guid, departmentGuid, status);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.assets.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_depreciation_schedule",
    "Returns the monthly depreciation schedule for a specific fixed asset from InformationRegister_НачислениеАмортизацииОСБухгалтерскийУчет. Shows per-period depreciation amount and running accumulated total. Drill: call onec_analyze_depreciation_impact to see P&L effect, or onec_get_account_card('7210'/'8110', ...) to verify posted entries match the schedule.",
    {
      assetGuid: z.string().uuid().describe("Fixed asset Ref_Key from onec_get_fixed_asset_register"),
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
    },
    async ({ assetGuid, periodFrom, periodTo }) => {
      try {
        const result = await svc.getDepreciationSchedule(assetGuid, periodFrom, periodTo);
        return ok(result, { rowCount: result.entries.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_analyze_depreciation_impact",
    "Computes total depreciation charged over a period from InformationRegister_НачислениеАмортизацииОСБухгалтерскийУчет and compares to GL debit turnovers on accounts 7210 (admin) and 8110 (production). Use to verify P&L impact and confirm depreciation is fully posted. Drill: call onec_get_account_card with account 7210 or 8110 to see individual postings.",
    {
      periodFrom: z.string().describe("YYYY-MM-DD"),
      periodTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ periodFrom, periodTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.analyzeDepreciationImpact(periodFrom, periodTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_impairment_indicators",
    "Identifies fixed assets whose age (months since acquisition) exceeds their stated useful life, flagging them as USEFUL_LIFE_EXCEEDED. These are candidates for impairment review under IFRS/GAAP. Drill: call onec_get_disposal_candidates for the prioritized disposal list, or onec_get_depreciation_schedule(assetGuid) to review residual value.",
    {
      asOfDate: z.string().describe("Reference date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getImpairmentIndicators(asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_disposal_candidates",
    "Returns fixed assets that have exceeded their useful life and are candidates for write-off (Document_СписаниеОС). Based on onec_get_impairment_indicators logic. Drill: verify each asset in onec_get_fixed_asset_register, then check onec_get_depreciation_schedule to confirm full depreciation before disposal.",
    {
      asOfDate: z.string().describe("Reference date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getDisposalCandidates(asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.length });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_asset_location_audit",
    "Compares the registered department (Подразделение_Key) of each fixed asset in Catalog_ОсновныеСредства with the physical location from InformationRegister_МестонахождениеОСБухгалтерскийУчет and flags mismatches. Use during inventory count or annual audit. Drill: investigate mismatches by calling onec_get_fixed_asset_register filtered by departmentGuid.",
    {
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.getAssetLocationAudit(org.guid);
        const mismatches = result.filter(r => r.mismatch);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.length, note: `${mismatches.length} расхождений местонахождения` });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_fa_completeness",
    "Validates that the fixed asset register is complete: (1) total acquisition cost matches GL balance on accounts 2410+2420 within 0.01 KZT; (2) all assets with positive useful life have accumulated depreciation. Returns passed flag, difference amount, and issue list. Run at month-end close. Drill: call onec_get_account_card('2410', ...) to trace discrepancies.",
    {
      asOfDate: z.string().describe("Balance date YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ asOfDate, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await svc.validateFaCompleteness(asOfDate, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined, rowCount: result.issues.length });
      } catch (e) { return wrapError(e); }
    },
  );
}
