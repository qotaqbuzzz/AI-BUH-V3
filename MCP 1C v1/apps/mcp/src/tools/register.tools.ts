import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RegisterService } from "@aibos/services";
import { wrapError, ok, resolveOrg } from "./utils.js";

export function registerRegisterTools(server: McpServer, reg: RegisterService): void {
  server.tool(
    "onec_get_exchange_rates",
    "Get current or historical exchange rates from InformationRegister_КурсыВалют (slice last). Fields: Курс, Кратность.",
    {
      currencyCode: z.string().optional().describe("Currency code, e.g. 'USD', 'EUR', 'RUB'"),
      date: z.string().optional().describe("Date YYYY-MM-DD (default: latest available)"),
    },
    async ({ currencyCode, date }) => {
      try {
        const result = await reg.getExchangeRates(currencyCode, date);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_contractor_settlements",
    "Get receivables/payables by contractor from AccumulationRegister_ВзаиморасчетыОрганизацийСКонтрагентами.",
    {
      contractorGuid: z.string().optional().describe("Filter by contractor Ref_Key"),
      organizationGuid: z.string().optional(),
    },
    async ({ contractorGuid, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reg.getContractorSettlements(contractorGuid, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_account_breakdown",
    "Get account balance breakdown by sub-accounts (субконто) — nomenclature, warehouse, or contractor — from AccountingRegister_Типовой/Balance. Use to drill down into any balance account (1310, 1330, 1210, 3310, etc.). Returns rows with item name, warehouse/contractor name, quantity, and balance amount. Use dateTo to get a historical balance as of that date.",
    {
      accountCode: z.string().regex(/^\d{4}(\.\d{1,4})?$/, "Account code must be 4 digits with optional sub-account (e.g. '8110', '3310.01')").describe("Account code, e.g. '1330', '1310', '1210', '3310'"),
      dateTo: z.string().describe("Balance as-of date YYYY-MM-DD"),
      organizationGuid: z.string().optional().describe("Filter by organization Ref_Key"),
    },
    async ({ accountCode, dateTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reg.getAccountBreakdown(accountCode, dateTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_account_card",
    "Get account card (карточка счёта): individual debit/credit postings for an account code over a date range from AccountingRegister_Типовой_RecordType. Shows each posting with date, source document GUID, line number, amount, and corresponding account. Use to trace every movement through any account.",
    {
      accountCode: z.string().regex(/^\d{4}(\.\d{1,4})?$/, "Account code must be 4 digits with optional sub-account (e.g. '8110', '3310.01')").describe("Account code, e.g. '3310', '1210', '8110', '6010'"),
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ accountCode, dateFrom, dateTo, organizationGuid }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reg.getAccountCard(accountCode, dateFrom, dateTo, org.guid);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_inventory_balance",
    "Get inventory balances (quantity + cost) from AccumulationRegister_ТоварыОрганизацийБУ.",
    {
      organizationGuid: z.string().optional(),
      nomenclatureGuid: z.string().optional().describe("Filter by specific nomenclature Ref_Key"),
      date: z.string().optional().describe("Balance as-of date YYYY-MM-DD"),
    },
    async ({ organizationGuid, nomenclatureGuid, date }) => {
      try {
        const org = resolveOrg(organizationGuid);
        const result = await reg.getInventoryBalance(org.guid, nomenclatureGuid, date);
        return ok(result, { orgGuid: org.guid, orgGuidCorrected: org.corrected || undefined });
      } catch (e) { return wrapError(e); }
    },
  );
}
