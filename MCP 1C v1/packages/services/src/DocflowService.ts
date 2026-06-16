import type { DocflowClient, DocflowTask, DocflowDocument, TaskFilter, DocumentFilter, CreateTaskDto, CreateDocumentDto } from "@aibos/onec-client";

export type { DocflowTask, DocflowDocument };

export interface ApprovalRoute {
  readonly docGuid:   string;
  readonly docTitle:  string;
  readonly tasks:     readonly DocflowTask[];
  readonly isBlocked: boolean;
  readonly nextStep:  string | null;
}

export class DocflowService {
  constructor(private readonly client: DocflowClient) {}

  async getMyTasks(assignee: string, filter?: Omit<TaskFilter, "assignee">): Promise<DocflowTask[]> {
    return this.client.getTasks({ ...filter, assignee });
  }

  async getOverdueTasks(filter?: TaskFilter): Promise<DocflowTask[]> {
    const all = await this.client.getTasks(filter);
    return all.filter(t => t.status === "overdue");
  }

  async getPendingTasks(filter?: TaskFilter): Promise<DocflowTask[]> {
    const all = await this.client.getTasks(filter);
    return all.filter(t => t.status === "new" || t.status === "in_progress");
  }

  async createApprovalTask(params: {
    subject:  string;
    body:     string;
    to:       string;
    dueDate?: string;
    docGuid?: string;
  }): Promise<DocflowTask> {
    const dto: CreateTaskDto = {
      subject:     params.subject,
      description: params.body,
      assignee:    params.to,
      dueDate:     params.dueDate,
      priority:    "high",
      docGuid:     params.docGuid,
    };
    return this.client.createTask(dto);
  }

  async acceptTask(guid: string, comment: string): Promise<void> {
    return this.client.completeTask(guid, { result: "accept", comment });
  }

  async rejectTask(guid: string, comment: string): Promise<void> {
    return this.client.completeTask(guid, { result: "reject", comment });
  }

  async getDocuments(filter?: DocumentFilter): Promise<DocflowDocument[]> {
    return this.client.getDocuments(filter);
  }

  async getDocument(guid: string): Promise<DocflowDocument> {
    return this.client.getDocument(guid);
  }

  async createAndSendDocument(dto: CreateDocumentDto): Promise<DocflowDocument> {
    const doc = await this.client.createDocument(dto);
    await this.client.sendForApproval(doc.guid);
    return doc;
  }

  async getApprovalRoute(docGuid: string): Promise<ApprovalRoute> {
    const [doc, tasks] = await Promise.all([
      this.client.getDocument(docGuid),
      this.client.getTasks({ top: 50 }),
    ]);

    const docTasks = tasks.filter(t => t.docGuid === docGuid);
    const pending  = docTasks.filter(t => t.status === "new" || t.status === "in_progress");
    const nextStep = pending.length > 0 ? `Ожидает: ${pending[0]?.assignee ?? "?"}` : null;

    return {
      docGuid,
      docTitle:  doc.title,
      tasks:     docTasks,
      isBlocked: pending.length > 0,
      nextStep,
    };
  }

  async searchByContractor(contractorName: string): Promise<DocflowDocument[]> {
    return this.client.getDocuments({ contractor: contractorName, top: 100 });
  }

  isAvailable(): boolean {
    return this.client.isConfigured();
  }
}
