export class OneCError extends Error {
    status;
    odataCode;
    requestUrl;
    constructor(status, odataCode, message, requestUrl) {
        super(message);
        this.status = status;
        this.odataCode = odataCode;
        this.requestUrl = requestUrl;
        this.name = "OneCError";
    }
}
export class OneCAuthError extends OneCError {
    constructor(url) {
        super(401, "AuthenticationRequired", "Неверные учётные данные 1С. Проверьте ONEC_USERNAME и ONEC_PASSWORD в .env", url);
        this.name = "OneCAuthError";
    }
}
export class OneCForbiddenError extends OneCError {
    constructor(entity, url) {
        super(403, "AccessDenied", `Недостаточно прав доступа к объекту "${entity}". Обратитесь к администратору 1С`, url);
        this.name = "OneCForbiddenError";
    }
}
export class OneCNotFoundError extends OneCError {
    constructor(entity, url) {
        super(404, "NotFound", `Объект не найден: ${entity}. Проверьте правильность идентификатора`, url);
        this.name = "OneCNotFoundError";
    }
}
export class OneCServerError extends OneCError {
    constructor(message, url) {
        super(500, "ServerError", `Ошибка сервера 1С: ${message}`, url);
        this.name = "OneCServerError";
    }
}
export class OneCNetworkError extends OneCError {
    constructor(url) {
        super(0, "NetworkError", "Превышено время ожидания ответа от 1С (30с). Сервер недоступен или перегружен", url);
        this.name = "OneCNetworkError";
    }
}
export function parseODataError(body) {
    try {
        const parsed = JSON.parse(body);
        const err = parsed["odata.error"];
        if (err) {
            const msg = err["message"];
            if (msg && typeof msg["value"] === "string")
                return msg["value"];
            if (typeof err["message"] === "string")
                return err["message"];
        }
        return body.slice(0, 300);
    }
    catch {
        return body.slice(0, 300);
    }
}
export function createOneCError(status, body, url) {
    const message = parseODataError(body);
    switch (status) {
        case 401: return new OneCAuthError(url);
        case 403: return new OneCForbiddenError(message, url);
        case 404: return new OneCNotFoundError(message, url);
        default: return new OneCServerError(message, url);
    }
}
//# sourceMappingURL=errors.js.map