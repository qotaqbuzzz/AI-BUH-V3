import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { PeriodCloseValidator } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerPeriodCloseValidationTools(server: McpServer, validator: PeriodCloseValidator): void {
  server.tool(
    "onec_validate_period_close_readiness",
    "Pre-flight check before posting ЗакрытиеМесяца: unposted docs by type, depreciation accrual presence, existing month-close status. See kz-agro-validation-rules.md#A.4.",
    {
      year: z.number().int().min(2020).max(2030),
      month: z.number().int().min(1).max(12),
      organizationGuid: z.string().uuid(),
    },
    async ({ year, month, organizationGuid }) => {
      try { return ok(await validator.validatePeriodCloseReadiness(year, month, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_accrual_alignment",
    "Verify accruals follow their bases: revenue requires VAT, salary requires ОПВ. Flags missing tax accruals proportional to underlying activity. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateAccrualAlignment(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_depreciation_completeness",
    "Check that depreciation (2420 credit turnover) was posted for the period if fixed assets exist (2410 balance > 0). Flags missing or suspiciously low depreciation. See kz-agro-validation-rules.md#A.4.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateDepreciationCompleteness(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_wip_closure",
    "Seasonal validation of 8110/8112 (НЗП растениеводства): zero in winter, growing in spring, closing to 1320 during harvest, zero after. See kz-agro-validation-rules.md#A.3.",
    {
      year: z.number().int().min(2020).max(2030),
      month: z.number().int().min(1).max(12),
      organizationGuid: z.string().uuid(),
    },
    async ({ year, month, organizationGuid }) => {
      try { return ok(await validator.validateWIPClosure(year, month, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_validate_cogs_basis",
    "Cross-check 7010 (Себестоимость, Дт) ≈ 1320 (Готовая продукция, Кт) for the period. Deviation means COGS not based on actual FG cost. See kz-agro-validation-rules.md#A.3.",
    {
      dateFrom: z.string(),
      dateTo: z.string(),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ dateFrom, dateTo, organizationGuid }) => {
      try { return ok(await validator.validateCOGSBasis(dateFrom, dateTo, organizationGuid)); }
      catch (e) { return wrapError(e); }
    },
  );
}
