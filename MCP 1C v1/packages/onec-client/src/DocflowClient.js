/**
 * HTTP-клиент для 1С:Документооборот.
 * Поддерживает REST API (HTTP-сервис), OData и встроенные сервисы.
 * Basic Auth, retry с экспоненциальным backoff.
 */
// ── Error types ────────────────────────────────────────────────────────────
export class DocflowError extends Error {
    statusCode;
    url;
    constructor(message, statusCode, url) {
        super(message);
        this.statusCode = statusCode;
        this.url = url;
        this.name = "DocflowError";
    }
}
// ── Mappers ────────────────────────────────────────────────────────────────
function mapStatus(raw) {
    const map = {
        "Новое": "new",
        "ВРаботе": "in_progress",
        "Выполнено": "completed",
        "Просрочено": "overdue",
        "Отменено": "cancelled",
    };
    return map[raw ?? ""] ?? "new";
}
function mapPriority(raw) {
    const map = {
        "Низкий": "low",
        "Обычный": "normal",
        "Высокий": "high",
        "Критический": "critical",
    };
    return map[raw ?? ""] ?? "normal";
}
function mapDocStatus(raw) {
    const map = {
        "Черновик": "draft",
        "НаСогласовании": "in_approval",
        "Согласован": "approved",
        "Отклонён": "rejected",
        "Архив": "archived",
    };
    return map[raw ?? ""] ?? "draft";
}
function toTask(r) {
    return {
        guid: r.Ref_Key ?? "",
        number: r.Number ?? "",
        subject: r.Тема ?? "",
        description: r.Описание ?? "",
        author: r.Автор ?? "",
        assignee: r.Исполнитель ?? "",
        dueDate: r.СрокИсполнения ?? null,
        createdAt: r.ДатаСоздания ?? "",
        status: mapStatus(r.Статус),
        priority: mapPriority(r.Приоритет),
        docGuid: r.ПредметGUID ?? null,
    };
}
function toDocument(r) {
    return {
        guid: r.Ref_Key ?? "",
        number: r.Number ?? "",
        title: r.Заголовок ?? "",
        kind: r.Вид ?? "",
        author: r.Автор ?? "",
        createdAt: r.ДатаСоздания ?? "",
        updatedAt: r.ДатаИзменения ?? "",
        status: mapDocStatus(r.Статус),
        contractor: r.Контрагент ?? null,
        amount: r.Сумма ?? null,
        currency: r.Валюта ?? null,
        filePath: r.Файл ?? null,
    };
}
// ── Client ─────────────────────────────────────────────────────────────────
export class DocflowClient {
    baseUrl;
    authHeader;
    timeoutMs;
    maxRetries;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.authHeader = "Basic " + Buffer.from(`${config.username}:${config.password}`).toString("base64");
        this.timeoutMs = config.timeoutMs;
        this.maxRetries = config.maxRetries;
    }
    async request(method, path, body) {
        const url = `${this.baseUrl}/${path.replace(/^\//, "")}`;
        const headers = {
            Authorization: this.authHeader,
            Accept: "application/json",
            "Content-Type": "application/json; charset=utf-8",
        };
        let attempt = 0;
        while (true) {
            attempt++;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
            try {
                const res = await fetch(url, {
                    method,
                    headers,
                    body: body !== undefined ? JSON.stringify(body) : undefined,
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (res.ok || res.status === 204) {
                    if (res.status === 204)
                        return undefined;
                    const text = await res.text();
                    if (!text)
                        return undefined;
                    return JSON.parse(text);
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
            }
            catch (err) {
                clearTimeout(timeoutId);
                if (err instanceof DocflowError)
                    throw err;
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
    async getTasks(filter = {}) {
        const params = new URLSearchParams({ $format: "json" });
        if (filter.assignee)
            params.set("Исполнитель", filter.assignee);
        if (filter.status)
            params.set("Статус", filter.status);
        if (filter.dateFrom)
            params.set("НачалоПериода", filter.dateFrom);
        if (filter.dateTo)
            params.set("КонецПериода", filter.dateTo);
        if (filter.top)
            params.set("$top", String(filter.top));
        const raw = await this.request("GET", `hs/tasks?${params}`);
        return (raw?.value ?? []).map(toTask);
    }
    async getTask(guid) {
        const raw = await this.request("GET", `hs/tasks/${guid}?$format=json`);
        return toTask(raw);
    }
    async createTask(dto) {
        const body = {
            Тема: dto.subject,
            Описание: dto.description,
            Исполнитель: dto.assignee,
            СрокИсполнения: dto.dueDate,
            Приоритет: dto.priority ?? "normal",
            ПредметGUID: dto.docGuid,
        };
        const raw = await this.request("POST", "hs/tasks", body);
        return toTask(raw);
    }
    async completeTask(guid, dto) {
        await this.request("POST", `hs/tasks/${guid}/complete`, {
            Результат: dto.result,
            Комментарий: dto.comment,
            Кому: dto.to,
        });
    }
    // ── Documents ────────────────────────────────────────────────────────────
    async getDocuments(filter = {}) {
        const params = new URLSearchParams({ $format: "json" });
        if (filter.contractor)
            params.set("Контрагент", filter.contractor);
        if (filter.kind)
            params.set("Вид", filter.kind);
        if (filter.status)
            params.set("Статус", filter.status);
        if (filter.dateFrom)
            params.set("НачалоПериода", filter.dateFrom);
        if (filter.dateTo)
            params.set("КонецПериода", filter.dateTo);
        if (filter.search)
            params.set("Поиск", filter.search);
        if (filter.top)
            params.set("$top", String(filter.top));
        const raw = await this.request("GET", `hs/documents?${params}`);
        return (raw?.value ?? []).map(toDocument);
    }
    async getDocument(guid) {
        const raw = await this.request("GET", `hs/documents/${guid}?$format=json`);
        return toDocument(raw);
    }
    async createDocument(dto) {
        const body = {
            Заголовок: dto.title,
            Вид: dto.kind,
            Описание: dto.description,
            Контрагент: dto.contractor,
            Сумма: dto.amount,
            Валюта: dto.currency,
            Содержание: dto.content,
        };
        const raw = await this.request("POST", "hs/documents", body);
        return toDocument(raw);
    }
    async sendForApproval(guid) {
        await this.request("POST", `hs/documents/${guid}/send-for-approval`, {});
    }
    isConfigured() {
        return this.baseUrl.length > 0 && !this.baseUrl.includes("not-configured");
    }
}
//# sourceMappingURL=DocflowClient.js.map