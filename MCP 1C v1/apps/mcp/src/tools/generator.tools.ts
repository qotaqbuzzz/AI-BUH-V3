import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { DocumentGeneratorService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

const OUTPUT_DIR = "reports/generated";

function saveAndReturn(doc: { filename: string; html: string; title: string; type: string; generatedAt: string }) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const path = join(OUTPUT_DIR, doc.filename);
  writeFileSync(path, doc.html, "utf-8");
  return ok({ title: doc.title, type: doc.type, savedTo: path, generatedAt: doc.generatedAt, hint: "Откройте файл в браузере, затем Ctrl+P → Сохранить как PDF" });
}

export function registerGeneratorTools(server: McpServer, gen: DocumentGeneratorService): void {

  server.tool(
    "onec_generate_act_sverki",
    "Generate Акт сверки взаиморасчётов (reconciliation act) as HTML for a contractor and period. Pulls live data: contractor balance by account + all payment movements. Saves to reports/generated/. Open in browser to print/export as PDF.",
    {
      contractorGuid: z.string().uuid().describe("Contractor Ref_Key"),
      dateFrom:       z.string().describe("Period start YYYY-MM-DD"),
      dateTo:         z.string().describe("Period end YYYY-MM-DD"),
      orgGuid:        z.string().uuid().optional().describe("Organization Ref_Key (omit for default)"),
    },
    async ({ contractorGuid, dateFrom, dateTo, orgGuid }) => {
      try {
        const doc = await gen.generateActSverki({ contractorGuid, dateFrom, dateTo, orgGuid });
        return saveAndReturn(doc);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_generate_debt_certificate",
    "Generate Справка о задолженности (debt certificate) as HTML for a contractor as of a given date. Shows all accounts, balances, and a signed conclusion. Saves to reports/generated/.",
    {
      contractorGuid: z.string().uuid().describe("Contractor Ref_Key"),
      date:           z.string().optional().describe("As-of date YYYY-MM-DD (omit for today)"),
      orgGuid:        z.string().uuid().optional(),
      certNumber:     z.string().optional().describe("Certificate reference number (e.g. 'Справка-2026-042')"),
    },
    async ({ contractorGuid, date, orgGuid, certNumber }) => {
      try {
        const doc = await gen.generateDebtCertificate({ contractorGuid, date, orgGuid, certNumber });
        return saveAndReturn(doc);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_generate_creditors_report",
    "Generate full Реестр кредиторской задолженности (creditors register) as a printable HTML report with color-coded aging, contracts, and payment history. Covers accounts 3310/3350/3387. Saves to reports/generated/.",
    {
      orgGuid: z.string().uuid().optional().describe("Organization Ref_Key"),
      date:    z.string().optional().describe("As-of date YYYY-MM-DD (omit for today)"),
      title:   z.string().optional().describe("Custom report title"),
    },
    async ({ orgGuid, date, title }) => {
      try {
        const doc = await gen.generateCreditorsReport({ orgGuid, date, title });
        return saveAndReturn(doc);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_generate_obligation_notice",
    "Generate Уведомление о задолженности (formal demand/notice letter) as HTML for a contractor. Includes total owed, breakdown by account, and due date. Saves to reports/generated/.",
    {
      contractorGuid: z.string().uuid().describe("Contractor Ref_Key"),
      date:           z.string().optional().describe("Balance as-of date YYYY-MM-DD"),
      orgGuid:        z.string().uuid().optional(),
      noticeNumber:   z.string().optional().describe("Reference number, e.g. 'УВ-2026-018'"),
      dueDate:        z.string().optional().describe("Requested payment due date YYYY-MM-DD"),
    },
    async ({ contractorGuid, date, orgGuid, noticeNumber, dueDate }) => {
      try {
        const doc = await gen.generateObligationNotice({ contractorGuid, date, orgGuid, noticeNumber, dueDate });
        return saveAndReturn(doc);
      } catch (e) { return wrapError(e); }
    },
  );
}
