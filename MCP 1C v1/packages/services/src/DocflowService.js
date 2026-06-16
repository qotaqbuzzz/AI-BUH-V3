export class DocflowService {
    client;
    constructor(client) {
        this.client = client;
    }
    async getMyTasks(assignee, filter) {
        return this.client.getTasks({ ...filter, assignee });
    }
    async getOverdueTasks(filter) {
        const all = await this.client.getTasks(filter);
        return all.filter(t => t.status === "overdue");
    }
    async getPendingTasks(filter) {
        const all = await this.client.getTasks(filter);
        return all.filter(t => t.status === "new" || t.status === "in_progress");
    }
    async createApprovalTask(params) {
        const dto = {
            subject: params.subject,
            description: params.body,
            assignee: params.to,
            dueDate: params.dueDate,
            priority: "high",
            docGuid: params.docGuid,
        };
        return this.client.createTask(dto);
    }
    async acceptTask(guid, comment) {
        return this.client.completeTask(guid, { result: "accept", comment });
    }
    async rejectTask(guid, comment) {
        return this.client.completeTask(guid, { result: "reject", comment });
    }
    async getDocuments(filter) {
        return this.client.getDocuments(filter);
    }
    async getDocument(guid) {
        return this.client.getDocument(guid);
    }
    async createAndSendDocument(dto) {
        const doc = await this.client.createDocument(dto);
        await this.client.sendForApproval(doc.guid);
        return doc;
    }
    async getApprovalRoute(docGuid) {
        const [doc, tasks] = await Promise.all([
            this.client.getDocument(docGuid),
            this.client.getTasks({ top: 50 }),
        ]);
        const docTasks = tasks.filter(t => t.docGuid === docGuid);
        const pending = docTasks.filter(t => t.status === "new" || t.status === "in_progress");
        const nextStep = pending.length > 0 ? `Ожидает: ${pending[0]?.assignee ?? "?"}` : null;
        return {
            docGuid,
            docTitle: doc.title,
            tasks: docTasks,
            isBlocked: pending.length > 0,
            nextStep,
        };
    }
    async searchByContractor(contractorName) {
        return this.client.getDocuments({ contractor: contractorName, top: 100 });
    }
    isAvailable() {
        return this.client.isConfigured();
    }
}
//# sourceMappingURL=DocflowService.js.map