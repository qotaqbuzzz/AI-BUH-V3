import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AuditorService } from "@aibos/services";
import type { RegisterService } from "@aibos/services";
import type { ReportsService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerAuditorTools(server: McpServer, auditor: AuditorService, register: RegisterService, reports: ReportsService): void {
  server.tool(
    "onec_audit_period_quality",
    "Run a full quality audit of accounting work for a given month. Checks 5 blocks: (1) Completeness — unposted docs, salary accrual, month close; (2) Errors — manual entries (ОперацияБух), red storno, round amounts, night-time entries; (3) Balance correctness — Дт=Кт, atypical account signs, WIP seasonal check, bank balance; (4) Tax discipline — VAT vs revenue, payroll taxes, КПН (December); (5) Dynamics — revenue change vs prior period, manual entry growth. Returns structured ✅/⚠️/❌ report.",
    {
      organizationGuid: z.string().uuid().describe("Organization Ref_Key"),
      year: z.number().int().min(2020).max(2099),
      month: z.number().int().min(1).max(12),
    },
    async ({ organizationGuid, year, month }) => {
      try {
        const result = await auditor.auditPeriodQuality(organizationGuid, year, month, register, reports);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_document_journal_entries",
    "Get all accounting entries (проводки Дт/Кт) created by a document in AccountingRegister_Типовой. Use to verify correctness of postings.",
    {
      documentGuid: z.string().uuid().describe("Ref_Key of the document"),
      documentType: z.string().optional().describe("Document type for context (optional)"),
    },
    async ({ documentGuid }) => {
      try {
        const rows = await auditor.getDocumentJournalEntries(documentGuid);
        return ok(rows);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_verify_account_balance",
    "Verify account balance integrity: get both balance and turnovers for an account code to check consistency.",
    {
      accountCode: z.string().regex(/^\d{4}(\.\d{1,4})?$/, "Account code must be 4 digits with optional sub-account (e.g. '8110', '3310.01')").describe("Account code e.g. '1310', '8110', '6010'"),
      organizationGuid: z.string().uuid().optional(),
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
    },
    async ({ accountCode, organizationGuid, dateFrom, dateTo }) => {
      try {
        const [balance, turnovers] = await Promise.all([
          register.getAccountBalance(accountCode, organizationGuid, dateTo),
          register.getAccountTurnovers(accountCode, dateFrom, dateTo, organizationGuid),
        ]);
        return ok({ accountCode, closingBalance: balance, turnovers });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_esf_status",
    "Check ЭСФ (electronic invoice) registration status for a period from InformationRegister_АктуальныеЭСФ. Confirms mandatory Kazakhstan e-invoicing compliance.",
    {
      organizationGuid: z.string().uuid(),
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
    },
    async ({ organizationGuid, dateFrom, dateTo }) => {
      try {
        const rows = await auditor.getESFStatus(organizationGuid, dateFrom, dateTo);
        return ok({ count: rows.length, esf: rows });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_unposted_documents",
    "Find documents that are not posted (Posted = false) — incomplete/draft documents that may affect period reporting.",
    {
      documentType: z.string().describe("Document type without 'Document_' prefix"),
      dateFrom: z.string().describe("YYYY-MM-DD"),
      dateTo: z.string().describe("YYYY-MM-DD"),
      organizationGuid: z.string().uuid().optional(),
    },
    async ({ documentType, dateFrom, dateTo, organizationGuid }) => {
      try {
        const rows = await auditor.getUnpostedDocuments(documentType, dateFrom, dateTo, organizationGuid);
        return ok({ count: rows.length, documents: rows });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_get_month_close_status",
    "Check if month-closing document (ЗакрытиеМесяца) exists and is posted for a given organization and period.",
    {
      organizationGuid: z.string().uuid(),
      year: z.number().int().min(2000).max(2099),
      month: z.number().int().min(1).max(12),
    },
    async ({ organizationGuid, year, month }) => {
      try {
        const result = await auditor.getMonthCloseStatus(organizationGuid, year, month);
        return ok(result);
      } catch (e) { return wrapError(e); }
    },
  );
}
