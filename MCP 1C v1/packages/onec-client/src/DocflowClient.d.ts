/**
 * HTTP-клиент для 1С:Документооборот.
 * Поддерживает REST API (HTTP-сервис), OData и встроенные сервисы.
 * Basic Auth, retry с экспоненциальным backoff.
 */
export interface DocflowConfig {
    readonly baseUrl: string;
    readonly username: string;
    readonly password: string;
    readonly timeoutMs: number;
    readonly maxRetries: number;
}
export interface DocflowTask {
    readonly guid: string;
    readonly number: string;
    readonly subject: string;
    readonly description: string;
    readonly author: string;
    readonly assignee: string;
    readonly dueDate: string | null;
    readonly createdAt: string;
    readonly status: TaskStatus;
    readonly priority: TaskPriority;
    readonly docGuid: string | null;
}
export type TaskStatus = "new" | "in_progress" | "completed" | "overdue" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "critical";
export interface DocflowDocument {
    readonly guid: string;
    readonly number: string;
    readonly title: string;
    readonly kind: string;
    readonly author: string;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly status: DocumentStatus;
    readonly contractor: string | null;
    readonly amount: number | null;
    readonly currency: string | null;
    readonly filePath: string | null;
}
export type DocumentStatus = "draft" | "in_approval" | "approved" | "rejected" | "archived";
export interface CreateTaskDto {
    readonly subject: string;
    readonly description: string;
    readonly assignee: string;
    readonly dueDate?: string;
    readonly priority?: TaskPriority;
    readonly docGuid?: string;
}
export interface CreateDocumentDto {
    readonly title: string;
    readonly kind: string;
    readonly description: string;
    readonly contractor?: string;
    readonly amount?: number;
    readonly currency?: string;
    readonly content?: string;
}
export interface CompleteTaskDto {
    readonly result: "accept" | "reject" | "redirect";
    readonly comment: string;
    readonly to?: string;
}
export interface TaskFilter {
    readonly assignee?: string;
    readonly status?: TaskStatus;
    readonly dateFrom?: string;
    readonly dateTo?: string;
    readonly top?: number;
}
export interface DocumentFilter {
    readonly contractor?: string;
    readonly kind?: string;
    readonly status?: DocumentStatus;
    readonly dateFrom?: string;
    readonly dateTo?: string;
    readonly search?: string;
    readonly top?: number;
}
export declare class DocflowError extends Error {
    readonly statusCode: number;
    readonly url: string;
    constructor(message: string, statusCode: number, url: string);
}
export declare class DocflowClient {
    private readonly baseUrl;
    private readonly authHeader;
    private readonly timeoutMs;
    private readonly maxRetries;
    constructor(config: DocflowConfig);
    private request;
    getTasks(filter?: TaskFilter): Promise<DocflowTask[]>;
    getTask(guid: string): Promise<DocflowTask>;
    createTask(dto: CreateTaskDto): Promise<DocflowTask>;
    completeTask(guid: string, dto: CompleteTaskDto): Promise<void>;
    getDocuments(filter?: DocumentFilter): Promise<DocflowDocument[]>;
    getDocument(guid: string): Promise<DocflowDocument>;
    createDocument(dto: CreateDocumentDto): Promise<DocflowDocument>;
    sendForApproval(guid: string): Promise<void>;
    isConfigured(): boolean;
}
//# sourceMappingURL=DocflowClient.d.ts.map