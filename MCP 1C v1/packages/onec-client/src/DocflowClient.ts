/**
 * HTTP-клиент для 1С:Документооборот.
 * Поддерживает REST API (HTTP-сервис), OData и встроенные сервисы.
 * Basic Auth, retry с экспоненциальным backoff.
 */

// ── Config ─────────────────────────────────────────────────────────────────

export interface DocflowConfig {
  readonly baseUrl:    string;
  readonly username:   string;
  readonly password:   string;
  readonly timeoutMs:  number;
  readonly maxRetries: number;
}

// ── Domain types ───────────────────────────────────────────────────────────

export interface DocflowTask {
  readonly guid:        string;
  readonly number:      string;
  readonly subject:     string;
  readonly description: string;
  readonly author:      string;
  readonly assignee:    string;
  readonly dueDate:     string | null;
  readonly createdAt:   string;
  readonly status:      TaskStatus;
  readonly priority:    TaskPriority;
  readonly docGuid:     string | null;
}

export type TaskStatus   = "new" | "in_progress" | "completed" | "overdue" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "critical";

export interface DocflowDocument {
  readonly guid:        string;
  readonly number:      string;
  readonly title:       string;
  readonly kind:        string;
  readonly author:      string;
  readonly createdAt:   string;
  readonly updatedAt:   string;
  readonly status:      DocumentStatus;
  readonly contractor:  string | null;
  readonly amount:      number | null;
  readonly currency:    string | null;
  readonly filePath:    string | null;
}

export type DocumentStatus = "draft" | "in_approval" | "approved" | "rejected" | "archived";

export interface CreateTaskDto {
  readonly subject:     string;
  readonly description: string;
  readonly assignee:    string;
  readonly dueDate?:    string;
  readonly priority?:   TaskPriority;
  readonly docGuid?:    string;
}

export interface CreateDocumentDto {
  readonly title:       string;
  readonly kind:        string;
  readonly description: string;
  readonly contractor?: string;
  readonly amount?:     number;
  readonly currency?:   string;
  readonly content?:    string;
}

export interface CompleteTaskDto {
  readonly result:  "accept" | "reject" | "redirect";
  readonly comment: string;
  readonly to?:     string;
}

export interface TaskFilter {
  readonly assignee?:  string;
  readonly status?:    TaskStatus;
  readonly dateFrom?:  string;
  readonly dateTo?:    string;
  readonly top?:       number;
}

export interface DocumentFilter {
  readonly contractor?: string;
  readonly kind?:       string;
  readonly status?:     DocumentStatus;
  readonly dateFrom?:   string;
  readonly dateTo?:     string;
  readonly search?:     string;
  readonly top?:        number;
}

// ── Error types ────────────────────────────────────────────────────────────

export class DocflowError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly url: string,
  ) {
    super(message);
    this.name = "DocflowError";
  }
}

// ── Raw API response shapes (1С:Документооборот HTTP-сервис) ───────────────

interface RawTask {
  Ref_Key?:     string;
  Number?:      string;
  Тема?:        string;
  Описание?:    string;
  Автор?:       string;
  Исполнитель?: string;
  СрокИсполнения?: string;
  ДатаСоздания?: string;
  Статус?:      string;
  Приоритет?:   string;
  ПредметGUID?: string;
}

interface RawDocument {
  Ref_Key?:      string;
  Number?:       string;
  Заголовок?:    string;
  Вид?:          string;
  Автор?:        string;
  ДатаСоздания?: string;
  ДатаИзменения?: string;
  Статус?:        string;
  Контрагент?:    string;
  Сумма?:         number;
  Валюта?:        string;
  Файл?:          string;
}

// ── Mappers ────────────────────────────────────────────────────────────────

function mapStatus(raw: string | undefined): TaskStatus {
  const map: Record<string, TaskStatus> = {
    "Новое":        "new",
    "ВРаботе":      "in_progress",
    "Выполнено":    "completed",
    "Просрочено":   "overdue",
    "Отменено":     "cancelled",
  };
  return map[raw ?? ""] ?? "new";
}

function mapPriority(raw: string | undefined): TaskPriority {
  const map: Record<string, TaskPriority> = {
    "Низкий":      "low",
    "Обычный":     "normal",
    "Высокий":     "high",
    "Критический": "critical",
  };
  return map[raw ?? ""] ?? "normal";
}

function mapDocStatus(raw: string | undefined): DocumentStatus {
  const map: Record<string, DocumentStatus> = {
    "Черновик":      "draft",
    "НаСогласовании": "in_approval",
    "Согласован":    "approved",
    "Отклонён":      "rejected",
    "Архив":         "archived",
  };
  return map[raw ?? ""] ?? "draft";
}

function toTask(r: RawTask): DocflowTask {
  return {
    guid:        r.Ref_Key        ?? "",
    number:      r.Number         ?? "",
    subject:     r.Тема           ?? "",
    description: r.Описание       ?? "",
    author:      r.Автор          ?? "",
    assignee:    r.Исполнитель    ?? "",
    dueDate:     r.СрокИсполнения ?? null,
    createdAt:   r.ДатаСоздания   ?? "",
    status:      mapStatus(r.Статус),
    priority:    mapPriority(r.Приоритет),
    docGuid:     r.ПредметGUID    ?? null,
  };
}

function toDocument(r: RawDocument): DocflowDocument {
  return {
    guid:       r.Ref_Key      ?? "",
    number:     r.Number       ?? "",
    title:      r.Заголовок    ?? "",
    kind:       r.Вид          ?? "",
    author:     r.Автор        ?? "",
    createdAt:  r.ДатаСоздания ?? "",
    updatedAt:  r.ДатаИзменения ?? "",
    status:     mapDocStatus(r.Статус),
    contractor: r.Контрагент   ?? null,
    amount:     r.Сумма        ?? null,
    currency:   r.Валюта       ?? null,
    filePath:   r.Файл         ?? null,
  };
}

// ── Client ─────────────────────────────────────────────────────────────────

export class DocflowClient {
  private readonly baseUrl:    string;
  private readonly authHeader: string;
  private readonly timeoutMs:  number;
  private readonly maxRetries: number;

  constructor(config: DocflowConfig) {
    this.baseUrl    = config.baseUrl.replace(/\/$/, "");
    this.authHeader = "Basic " + Buffer.from(`${config.username}:${config.password}`).toString("base64");
    this.timeoutMs  = config.timeoutMs;
    this.maxRetries = config.maxRetries;
  }

  private async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}/${path.replace(/^\//, "")}`;
    const headers: Record<string, string> = {
      Authorization:  this.authHeader,
      Accept:         "application/json",
      "Content-Type": "application/json; charset=utf-8",
    };

    let attempt = 0;
    while (true) {
      attempt++;
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const res = await fetch(url, {
          method,
          headers,
          body:   body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok || res.status === 204) {
          if (res.status === 204) return undefined as T;
          const text = await res.text();
          if (!text) return undefined as T;
          return JSON.parse(text) as T;
        }

        const text = await res.text();
        if ([401, 403, 404].includes(res.status)) {
          throw new DocflowError(`HTTP ${res.status}: ${text}`, res.status, url);
        }
        if (attempt < this.maxRetries && [500, 502, 503].includes(res.status)) {
          await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** (attempt - 1), 8000)));
          continue;
        }
        throw new DocflowError(`HTTP ${res.status}: ${text}`, res.status, url);
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof DocflowError) throw err;
        if (err instanceof Error && err.name === "AbortError") {
          throw new DocflowError(`Timeout after ${this.timeoutMs}ms`, 408, url);
        }
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw err;
      }
    }
  }

  // ── Tasks ────────────────────────────────────────────────────────────────

  async getTasks(filter: TaskFilter = {}): Promise<DocflowTask[]> {
    const params = new URLSearchParams({ $format: "json" });
    if (filter.assignee) params.set("Исполнитель", filter.assignee);
    if (filter.status)   params.set("Статус", filter.status);
    if (filter.dateFrom) params.set("НачалоПериода", filter.dateFrom);
    if (filter.dateTo)   params.set("КонецПериода", filter.dateTo);
    if (filter.top)      params.set("$top", String(filter.top));

    const raw = await this.request<{ value?: RawTask[] }>("GET", `hs/tasks?${params}`);
    return (raw?.value ?? []).map(toTask);
  }

  async getTask(guid: string): Promise<DocflowTask> {
    const raw = await this.request<RawTask>("GET", `hs/tasks/${guid}?$format=json`);
    return toTask(raw);
  }

  async createTask(dto: CreateTaskDto): Promise<DocflowTask> {
    const body = {
      Тема:           dto.subject,
      Описание:       dto.description,
      Исполнитель:    dto.assignee,
      СрокИсполнения: dto.dueDate,
      Приоритет:      dto.priority ?? "normal",
      ПредметGUID:    dto.docGuid,
    };
    const raw = await this.request<RawTask>("POST", "hs/tasks", body);
    return toTask(raw);
  }

  async completeTask(guid: string, dto: CompleteTaskDto): Promise<void> {
    await this.request("POST", `hs/tasks/${guid}/complete`, {
      Результат:  dto.result,
      Комментарий: dto.comment,
      Кому:        dto.to,
    });
  }

  // ── Documents ────────────────────────────────────────────────────────────

  async getDocuments(filter: DocumentFilter = {}): Promise<DocflowDocument[]> {
    const params = new URLSearchParams({ $format: "json" });
    if (filter.contractor) params.set("Контрагент", filter.contractor);
    if (filter.kind)       params.set("Вид", filter.kind);
    if (filter.status)     params.set("Статус", filter.status);
    if (filter.dateFrom)   params.set("НачалоПериода", filter.dateFrom);
    if (filter.dateTo)     params.set("КонецПериода", filter.dateTo);
    if (filter.search)     params.set("Поиск", filter.search);
    if (filter.top)        params.set("$top", String(filter.top));

    const raw = await this.request<{ value?: RawDocument[] }>("GET", `hs/documents?${params}`);
    return (raw?.value ?? []).map(toDocument);
  }

  async getDocument(guid: string): Promise<DocflowDocument> {
    const raw = await this.request<RawDocument>("GET", `hs/documents/${guid}?$format=json`);
    return toDocument(raw);
  }

  async createDocument(dto: CreateDocumentDto): Promise<DocflowDocument> {
    const body = {
      Заголовок:  dto.title,
      Вид:        dto.kind,
      Описание:   dto.description,
      Контрагент: dto.contractor,
      Сумма:      dto.amount,
      Валюта:     dto.currency,
      Содержание: dto.content,
    };
    const raw = await this.request<RawDocument>("POST", "hs/documents", body);
    return toDocument(raw);
  }

  async sendForApproval(guid: string): Promise<void> {
    await this.request("POST", `hs/documents/${guid}/send-for-approval`, {});
  }

  isConfigured(): boolean {
    return this.baseUrl.length > 0 && !this.baseUrl.includes("not-configured");
  }
}
