import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ProductionService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerProductionTools(server: McpServer, production: ProductionService): void {
  server.tool(
    "onec_get_production_costs",
    "Get accumulated WIP (незавершённое производство) on account 8110 (Основное производство). " +
    "Use for any manufacturer: grain farms, food processing, construction, factories. " +
    "Shows total work-in-progress balance for the current production cycle.",
    {
      organizationGuid: z.string().uuid().describe("Organization Ref_Key"),
      date: z.string().optional().describe("As-of date YYYY-MM-DD"),
    },
    async ({ organizationGuid, date }) => {
      try {
        const result = await production.getProductionCosts(organizationGuid, date);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_materials_balance",
    "Get raw materials and supplies balance (account 1310) from AccumulationRegister_ТоварыОрганизацийБУ. " +
    "Applicable to any industry: seeds/fertilizers (agro), raw materials (manufacturing), consumables (services).",
    {
      organizationGuid: z.string().uuid(),
      date: z.string().optional().describe("As-of date YYYY-MM-DD"),
      nomenclatureGuid: z.string().uuid().optional().describe("Filter by specific nomenclature item"),
    },
    async ({ organizationGuid, date, nomenclatureGuid }) => {
      try {
        const result = await production.getMaterialsBalance(organizationGuid, date, nomenclatureGuid);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_finished_goods_balance",
    "Get finished goods balance (account 1320 — Готовая продукция) from the accounting register. " +
    "Returns debit/credit balances and net stock value. Works for any industry producing or stocking finished goods.",
    {
      organizationGuid: z.string().uuid(),
      date: z.string().optional().describe("As-of date YYYY-MM-DD"),
    },
    async ({ organizationGuid, date }) => {
      try {
        const result = await production.getFinishedGoodsBalance(organizationGuid, date);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_payroll_taxes_summary",
    "Get KZ payroll tax register balances (ОПВ, СО, ВОСМС, ИПН) for a period. " +
    "Pulls from corresponding AccumulationRegister tables. Applicable to all KZ companies.",
    {
      organizationGuid: z.string().uuid(),
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
    },
    async ({ organizationGuid, dateFrom, dateTo }) => {
      try {
        const result = await production.getPayrollTaxesSummary(organizationGuid, dateFrom, dateTo);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_vat_register",
    "Get НДС register positions (AccumulationRegister_НДС_Balance) for a period.",
    {
      organizationGuid: z.string().uuid(),
      dateFrom: z.string(),
      dateTo: z.string(),
    },
    async ({ organizationGuid, dateFrom, dateTo }) => {
      try {
        const result = await production.getVatRegister(organizationGuid, dateFrom, dateTo);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_pl_summary",
    "P&L summary from accounting registers: revenue (6010), COGS (7010), overhead (7210). " +
    "Returns gross profit and operating profit. Works for any KZ industry.",
    {
      organizationGuid: z.string().uuid(),
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
    },
    async ({ organizationGuid, dateFrom, dateTo }) => {
      try {
        const result = await production.getPLSummary(organizationGuid, dateFrom, dateTo);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_calculate_payroll_taxes",
    "Calculate KZ payroll taxes for a given gross salary per НК РК 2026. " +
    "Pure calculation — no 1C call. Returns ОПВ, ОППВ, СО, ВОСМС, ООСМС, ИПН, СН, net salary, total employer cost. " +
    "МРП 2026 = 3,692 tg | МЗП = 85,000 tg | Standard ИПН deduction = 14 МРП = 51,688 tg.",
    {
      grossSalary: z.number().positive().describe("Gross salary in tenge"),
      hasDeductions: z.boolean().optional().default(true)
        .describe("Apply standard 14 МРП deduction for ИПН (default: true)"),
    },
    async ({ grossSalary, hasDeductions }) => {
      try {
        const result = production.calculatePayrollTaxes(grossSalary, hasDeductions);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_kpn_estimate",
    "Estimate КПН (corporate income tax) using actual 1C turnovers. " +
    "Base rate: 20% (НК РК Ст.313). " +
    "For agricultural producers: add isAgro=true to apply 70% reduction per Ст.285 НК РК. " +
    "Revenue from 6010, costs from 7010 + 7210 + 7710.",
    {
      organizationGuid: z.string().uuid(),
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      isAgro: z.boolean().optional().default(false)
        .describe("Apply 70% agricultural КПН reduction per Ст.285 НК РК (for agricultural producers only)"),
    },
    async ({ organizationGuid, dateFrom, dateTo, isAgro }) => {
      try {
        const result = await production.getKPNEstimate(organizationGuid, dateFrom, dateTo, isAgro);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );
}
