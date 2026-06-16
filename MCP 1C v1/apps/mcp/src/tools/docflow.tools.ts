import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DocflowService } from "@aibos/services";
import { wrapError, ok } from "./utils.js";

export function registerDocflowTools(server: McpServer, docflow: DocflowService): void {

  if (!docflow.isAvailable()) {
    server.tool(
      "onec_docflow_status",
      "Check if 1С:Документооборот integration is configured. Returns configuration status and setup instructions.",
      {},
      async () => ok({
        configured: false,
        message:    "1С:Документооборот не настроен. Добавьте в .env: DOCFLOW_BASE_URL, DOCFLOW_USERNAME, DOCFLOW_PASSWORD",
        hint:       "После настройки перезапустите MCP-сервер для активации всех инструментов документооборота.",
      }),
    );
    return;
  }

  server.tool(
    "onec_docflow_get_tasks",
    "Get tasks/assignments from 1С:Документооборот. Filter by assignee, status, or date range. Returns list of tasks with subject, status, due date, and linked document.",
    {
      assignee:  z.string().optional().describe("Filter by assignee name or GUID"),
      status:    z.enum(["new", "in_progress", "completed", "overdue", "cancelled"]).optional(),
      dateFrom:  z.string().optional().describe("YYYY-MM-DD"),
      dateTo:    z.string().optional().describe("YYYY-MM-DD"),
      top:       z.number().int().min(1).max(500).optional().default(50),
    },
    async ({ assignee, status, dateFrom, dateTo, top }) => {
      try {
        const tasks = assignee
          ? await docflow.getMyTasks(assignee, { status, dateFrom, dateTo, top })
          : await docflow.getPendingTasks({ status, dateFrom, dateTo, top });
        return ok(tasks);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_docflow_get_overdue",
    "Get all overdue tasks from 1С:Документооборот. Returns tasks past their due date that have not been completed.",
    {
      top: z.number().int().min(1).max(200).optional().default(100),
    },
    async ({ top }) => {
      try {
        const tasks = await docflow.getOverdueTasks({ top });
        return ok({ count: tasks.length, tasks });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_docflow_create_task",
    "Create a new task/assignment in 1С:Документооборот. Use for: approval requests, payment authorizations, document sign-off, audit follow-ups.",
    {
      subject:     z.string().min(3).describe("Task subject/title"),
      description: z.string().describe("Task body / instructions"),
      assignee:    z.string().describe("Assignee name or GUID"),
      dueDate:     z.string().optional().describe("Due date YYYY-MM-DD"),
      priority:    z.enum(["low", "normal", "high", "critical"]).optional().default("normal"),
      docGuid:     z.string().uuid().optional().describe("Linked document GUID"),
    },
    async ({ subject, description, assignee, dueDate, priority, docGuid }) => {
      try {
        const task = await docflow.createApprovalTask({ subject, body: description, to: assignee, dueDate, docGuid });
        return ok({ created: true, task });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_docflow_complete_task",
    "Complete (accept or reject) a task in 1С:Документооборот. Used for approving payments, signing documents, or rejecting requests with a reason.",
    {
      taskGuid: z.string().uuid().describe("Task GUID"),
      result:   z.enum(["accept", "reject"]).describe("Decision: accept = approve, reject = decline"),
      comment:  z.string().min(1).describe("Comment / reason for the decision"),
    },
    async ({ taskGuid, result, comment }) => {
      try {
        await (result === "accept"
          ? docflow.acceptTask(taskGuid, comment)
          : docflow.rejectTask(taskGuid, comment));
        return ok({ completed: true, taskGuid, result, comment });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_docflow_get_documents",
    "Search documents in 1С:Документооборот by contractor, type, status, or date range.",
    {
      contractor: z.string().optional().describe("Contractor name or GUID"),
      kind:       z.string().optional().describe("Document kind (e.g. 'Договор', 'Акт', 'Счёт')"),
      status:     z.enum(["draft", "in_approval", "approved", "rejected", "archived"]).optional(),
      dateFrom:   z.string().optional().describe("YYYY-MM-DD"),
      dateTo:     z.string().optional().describe("YYYY-MM-DD"),
      search:     z.string().optional().describe("Full-text search"),
      top:        z.number().int().min(1).max(500).optional().default(50),
    },
    async ({ contractor, kind, status, dateFrom, dateTo, search, top }) => {
      try {
        const docs = await docflow.getDocuments({ contractor, kind, status, dateFrom, dateTo, search, top });
        return ok(docs);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_docflow_get_document",
    "Get a single document from 1С:Документооборот by GUID, including full details and approval status.",
    {
      guid: z.string().uuid().describe("Document GUID"),
    },
    async ({ guid }) => {
      try {
        const doc = await docflow.getDocument(guid);
        return ok(doc);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_docflow_create_document",
    "Create a new document in 1С:Документооборот and optionally send it for approval. Use for: registering incoming/outgoing documents, creating internal orders, filing contracts.",
    {
      title:       z.string().min(3).describe("Document title"),
      kind:        z.string().describe("Document type (Договор / Акт / Счёт / Приказ / Письмо)"),
      description: z.string().describe("Document content / description"),
      contractor:  z.string().optional().describe("Contractor name"),
      amount:      z.number().optional().describe("Document amount"),
      currency:    z.string().optional().default("KZT"),
      sendForApproval: z.boolean().optional().default(false).describe("Immediately send for approval route"),
    },
    async ({ title, kind, description, contractor, amount, currency, sendForApproval }) => {
      try {
        const doc = sendForApproval
          ? await docflow.createAndSendDocument({ title, kind, description, contractor, amount, currency })
          : await docflow.getDocuments({ search: title, top: 1 }).then(async () => {
              return await docflow.createAndSendDocument({ title, kind, description, contractor, amount, currency });
            });
        return ok({ created: true, sentForApproval: sendForApproval, doc });
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_docflow_get_approval_route",
    "Get the current approval route and status for a document in 1С:Документооборот. Shows all tasks in the approval chain and who is blocking.",
    {
      docGuid: z.string().uuid().describe("Document GUID"),
    },
    async ({ docGuid }) => {
      try {
        const route = await docflow.getApprovalRoute(docGuid);
        return ok(route);
      } catch (e) { return wrapError(e); }
    },
  );

  server.tool(
    "onec_docflow_search_by_contractor",
    "Find all documents in 1С:Документооборот linked to a specific contractor name.",
    {
      contractorName: z.string().min(2).describe("Contractor name (partial match)"),
    },
    async ({ contractorName }) => {
      try {
        const docs = await docflow.searchByContractor(contractorName);
        return ok({ count: docs.length, docs });
      } catch (e) { return wrapError(e); }
    },
  );
}
