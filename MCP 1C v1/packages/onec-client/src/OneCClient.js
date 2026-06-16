import { createOneCError, OneCNetworkError } from "./errors.js";
export function wrapGuid(guid) {
    return `guid'${guid}'`;
}
export function buildQueryString(params) {
    const parts = ["$format=json"];
    if (params.filter)
        parts.push(`$filter=${encodeURIComponent(params.filter)}`);
    if (params.select)
        parts.push(`$select=${encodeURIComponent(params.select)}`);
    if (params.expand)
        parts.push(`$expand=${encodeURIComponent(params.expand)}`);
    if (params.orderby)
        parts.push(`$orderby=${encodeURIComponent(params.orderby)}`);
    if (params.top !== undefined)
        parts.push(`$top=${params.top}`);
    if (params.skip !== undefined)
        parts.push(`$skip=${params.skip}`);
    if (params.inlinecount)
        parts.push("$inlinecount=allpages");
    return parts.join("&");
}
export class OneCClient {
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
            let timeoutId;
            try {
                const controller = new AbortController();
                timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
                const response = await fetch(url, {
                    method,
                    headers,
                    body: body !== undefined ? JSON.stringify(body) : undefined,
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (response.ok || response.status === 204) {
                    if (response.status === 204 || response.headers.get("content-length") === "0") {
                        return undefined;
                    }
                    const text = await response.text();
                    if (!text)
                        return undefined;
                    return JSON.parse(text);
                }
                const responseText = await response.text();
                // Never retry auth/permission/not-found errors
                if ([401, 403, 404].includes(response.status)) {
                    throw createOneCError(response.status, responseText, url);
                }
                // Retry server errors with exponential backoff
                if (attempt < this.maxRetries && [500, 502, 503].includes(response.status)) {
                    await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** (attempt - 1), 8000)));
                    continue;
                }
                throw createOneCError(response.status, responseText, url);
            }
            catch (err) {
                if (timeoutId)
                    clearTimeout(timeoutId);
                if (err instanceof Error && err.name === "AbortError") {
                    throw new OneCNetworkError(url);
                }
                if (err instanceof Error && err.name === "OneCError")
                    throw err;
                if (attempt < this.maxRetries) {
                    await new Promise(r => setTimeout(r, 1000 * attempt));
                    continue;
                }
                throw err;
            }
        }
    }
    async getCollection(entitySet, params = {}) {
        const qs = buildQueryString({ top: 1000, ...params });
        const result = await this.request("GET", `${entitySet}?${qs}`);
        return result?.value ?? [];
    }
    async getByKey(entitySet, guid, params = {}) {
        const qs = buildQueryString(params);
        return this.request("GET", `${entitySet}(${wrapGuid(guid)})?${qs}`);
    }
    async create(entitySet, data) {
        return this.request("POST", entitySet, data);
    }
    async update(entitySet, guid, data) {
        await this.request("PATCH", `${entitySet}(${wrapGuid(guid)})`, data);
    }
    async delete(entitySet, guid) {
        await this.request("DELETE", `${entitySet}(${wrapGuid(guid)})`);
    }
    async postDocument(documentType, guid) {
        await this.request("POST", `Document_${documentType}(${wrapGuid(guid)})/Post()`);
    }
    async unpostDocument(documentType, guid) {
        await this.request("POST", `Document_${documentType}(${wrapGuid(guid)})/Unpost()`);
    }
    // Virtual table functions: Condition/Period are function parameters (not $filter)
    async getRegisterBalance(registerName, params = {}) {
        const { Condition, Period, ...odataParams } = params;
        const extra = [];
        if (Condition)
            extra.push(`Condition=${encodeURIComponent(Condition)}`);
        if (Period)
            extra.push(`Period=datetime'${Period}'`);
        const suffix = extra.length ? `&${extra.join("&")}` : "";
        return this.getCollectionWithSuffix(`${registerName}/Balance`, odataParams, suffix);
    }
    async getRegisterTurnovers(registerName, params = {}) {
        const { Condition, StartPeriod, EndPeriod, ...odataParams } = params;
        const extra = [];
        if (Condition)
            extra.push(`Condition=${encodeURIComponent(Condition)}`);
        if (StartPeriod)
            extra.push(`StartPeriod=datetime'${StartPeriod}'`);
        if (EndPeriod)
            extra.push(`EndPeriod=datetime'${EndPeriod}'`);
        const suffix = extra.length ? `&${extra.join("&")}` : "";
        return this.getCollectionWithSuffix(`${registerName}/Turnovers`, odataParams, suffix);
    }
    async getBalanceAndTurnovers(registerName, params = {}) {
        const { Condition, StartPeriod, EndPeriod, ...odataParams } = params;
        const extra = [];
        if (Condition)
            extra.push(`Condition=${encodeURIComponent(Condition)}`);
        if (StartPeriod)
            extra.push(`StartPeriod=datetime'${StartPeriod}'`);
        if (EndPeriod)
            extra.push(`EndPeriod=datetime'${EndPeriod}'`);
        const suffix = extra.length ? `&${extra.join("&")}` : "";
        return this.getCollectionWithSuffix(`${registerName}/BalanceAndTurnovers`, odataParams, suffix);
    }
    async getSliceLast(registerName, params = {}) {
        const { Condition, Period, ...odataParams } = params;
        const extra = [];
        if (Condition)
            extra.push(`Condition=${encodeURIComponent(Condition)}`);
        if (Period)
            extra.push(`Period=datetime'${Period}'`);
        const suffix = extra.length ? `&${extra.join("&")}` : "";
        return this.getCollectionWithSuffix(`${registerName}/SliceLast`, odataParams, suffix);
    }
    async getCollectionWithSuffix(entitySet, params, suffix) {
        const qs = buildQueryString({ top: 1000, ...params });
        const result = await this.request("GET", `${entitySet}?${qs}${suffix}`);
        return result?.value ?? [];
    }
    async getMetadata() {
        const url = `${this.baseUrl}/$metadata`;
        const headers = {
            Authorization: this.authHeader,
            Accept: "application/xml",
        };
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(url, { headers, signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok)
                throw createOneCError(response.status, await response.text(), url);
            return response.text();
        }
        catch (err) {
            clearTimeout(timeoutId);
            if (err instanceof Error && err.name === "AbortError")
                throw new OneCNetworkError(url);
            throw err;
        }
    }
}
//# sourceMappingURL=OneCClient.js.map