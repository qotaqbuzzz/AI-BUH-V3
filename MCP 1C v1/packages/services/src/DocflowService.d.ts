import type { DocflowClient, DocflowTask, DocflowDocument, TaskFilter, DocumentFilter, CreateDocumentDto } from "@aibos/onec-client";
export type { DocflowTask, DocflowDocument };
export interface ApprovalRoute {
    readonly docGuid: string;
    readonly docTitle: string;
    readonly tasks: readonly DocflowTask[];
    readonly isBlocked: boolean;
    readonly nextStep: string | null;
}
export declare class DocflowService {
    private readonly client;
    constructor(client: DocflowClient);
    getMyTasks(assignee: string, filter?: Omit<TaskFilter, "assignee">): Promise<DocflowTask[]>;
    getOverdueTasks(filter?: TaskFilter): Promise<DocflowTask[]>;
    getPendingTasks(filter?: TaskFilter): Promise<DocflowTask[]>;
    createApprovalTask(params: {
        subject: string;
        body: string;
        to: string;
        dueDate?: string;
        docGuid?: string;
    }): Promise<DocflowTask>;
    acceptTask(guid: string, comment: string): Promise<void>;
    rejectTask(guid: string, comment: string): Promise<void>;
    getDocuments(filter?: DocumentFilter): Promise<DocflowDocument[]>;
    getDocument(guid: string): Promise<DocflowDocument>;
    createAndSendDocument(dto: CreateDocumentDto): Promise<DocflowDocument>;
    getApprovalRoute(docGuid: string): Promise<ApprovalRoute>;
    searchByContractor(contractorName: string): Promise<DocflowDocument[]>;
    isAvailable(): boolean;
}
//# sourceMappingURL=DocflowService.d.ts.map