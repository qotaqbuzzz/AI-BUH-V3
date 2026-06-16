import type { OneCConfig, ODataQueryParams } from "./types.js";
import { createOneCError, OneCNetworkError } from "./errors.js";

export function wrapGuid(guid: string): string {
  return `guid'${guid}'`;
}

export function buildQueryString(params: ODataQueryParams): string {
  const parts: string[] = ["$format=json"];
  if (params.filter) parts.push(`$filter=${encodeURIComponent(params.filter)}`);
  if (params.select) parts.push(`$select=${encodeURIComponent(params.select)}`);
  if (params.expand) parts.push(`$expand=${encodeURIComponent(params.expand)}`);
  if (params.orderby) parts.push(`$orderby=${encodeURIComponent(params.orderby)}`);
  if (params.top !== undefined) parts.push(`$top=${params.top}`);
  if (params.skip !== undefined) parts.push(`$skip=${params.skip}`);
  if (params.inlinecount) parts.push("$inlinecount=allpages");
  return parts.join("&");
}

export class OneCClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(config: OneCConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.authHeader = "Basic " + Buffer.from(`${config.username}:${config.password}`).toString("base64");
    this.timeoutMs = config.timeoutMs;
    this.maxRetries = config.maxRetries;
  }

  private async request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}/${path.replace(/^\//, "")}`;
    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    };

    let attempt = 0;
    while (true) {
      attempt++;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
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
            return undefined as T;
          }
          const text = await response.text();
          if (!text) return undefined as T;
          return JSON.parse(text) as T;
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
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (err instanceof Error && err.name === "AbortError") {
          throw new OneCNetworkError(url);
        }
        if (err instanceof Error && err.name === "OneCError") throw err;
        if (attempt < this.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw err;
      }
    }
  }

  async getCollection<T>(entitySet: string, params: ODataQueryParams = {}): Promise<T[]> {
    const qs = buildQueryString({ top: 1000, ...params });
    const result = await this.request<{ value: T[] }>("GET", `${entitySet}?${qs}`);
    return result?.value ?? [];
  }

  async getByKey<T>(entitySet: string, guid: string, params: ODataQueryParams = {}): Promise<T> {
    const qs = buildQueryString(params);
    return this.request<T>("GET", `${entitySet}(${wrapGuid(guid)})?${qs}`);
  }

  async create<T>(entitySet: string, data: Partial<T>): Promise<T> {
    return this.request<T>("POST", entitySet, data);
  }

  async update(entitySet: string, guid: string, data: Record<string, unknown>): Promise<void> {
    await this.request<void>("PATCH", `${entitySet}(${wrapGuid(guid)})`, data);
  }

  async delete(entitySet: string, guid: string): Promise<void> {
    await this.request<void>("DELETE", `${entitySet}(${wrapGuid(guid)})`);
  }

  async postDocument(documentType: string, guid: string): Promise<void> {
    await this.request<void>("POST", `Document_${documentType}(${wrapGuid(guid)})/Post()`);
  }

  async unpostDocument(documentType: string, guid: string): Promise<void> {
    await this.request<void>("POST", `Document_${documentType}(${wrapGuid(guid)})/Unpost()`);
  }

  // Virtual table functions: Condition/Period are function parameters (not $filter)
  async getRegisterBalance<T>(
    registerName: string,
    params: ODataQueryParams & { Condition?: string; Period?: string } = {},
  ): Promise<T[]> {
    const { Condition, Period, ...odataParams } = params;
    const extra: string[] = [];
    if (Condition) extra.push(`Condition=${encodeURIComponent(Condition)}`);
    if (Period) extra.push(`Period=datetime'${Period}'`);
    const suffix = extra.length ? `&${extra.join("&")}` : "";
    return this.getCollectionWithSuffix<T>(`${registerName}/Balance`, odataParams, suffix);
  }

  async getRegisterTurnovers<T>(
    registerName: string,
    params: ODataQueryParams & { Condition?: string; StartPeriod?: string; EndPeriod?: string } = {},
  ): Promise<T[]> {
    const { Condition, StartPeriod, EndPeriod, ...odataParams } = params;
    const extra: string[] = [];
    if (Condition) extra.push(`Condition=${encodeURIComponent(Condition)}`);
    if (StartPeriod) extra.push(`StartPeriod=datetime'${StartPeriod}'`);
    if (EndPeriod) extra.push(`EndPeriod=datetime'${EndPeriod}'`);
    const suffix = extra.length ? `&${extra.join("&")}` : "";
    return this.getCollectionWithSuffix<T>(`${registerName}/Turnovers`, odataParams, suffix);
  }

  async getBalanceAndTurnovers<T>(
    registerName: string,
    params: ODataQueryParams & { Condition?: string; StartPeriod?: string; EndPeriod?: string } = {},
  ): Promise<T[]> {
    const { Condition, StartPeriod, EndPeriod, ...odataParams } = params;
    const extra: string[] = [];
    if (Condition) extra.push(`Condition=${encodeURIComponent(Condition)}`);
    if (StartPeriod) extra.push(`StartPeriod=datetime'${StartPeriod}'`);
    if (EndPeriod) extra.push(`EndPeriod=datetime'${EndPeriod}'`);
    const suffix = extra.length ? `&${extra.join("&")}` : "";
    return this.getCollectionWithSuffix<T>(`${registerName}/BalanceAndTurnovers`, odataParams, suffix);
  }

  async getSliceLast<T>(
    registerName: string,
    params: ODataQueryParams & { Condition?: string; Period?: string } = {},
  ): Promise<T[]> {
    const { Condition, Period, ...odataParams } = params;
    const extra: string[] = [];
    if (Condition) extra.push(`Condition=${encodeURIComponent(Condition)}`);
    if (Period) extra.push(`Period=datetime'${Period}'`);
    const suffix = extra.length ? `&${extra.join("&")}` : "";
    return this.getCollectionWithSuffix<T>(`${registerName}/SliceLast`, odataParams, suffix);
  }

  private async getCollectionWithSuffix<T>(entitySet: string, params: ODataQueryParams, suffix: string): Promise<T[]> {
    const qs = buildQueryString({ top: 1000, ...params });
    const result = await this.request<{ value: T[] }>("GET", `${entitySet}?${qs}${suffix}`);
    return result?.value ?? [];
  }

  async getMetadata(): Promise<string> {
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
      if (!response.ok) throw createOneCError(response.status, await response.text(), url);
      return response.text();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") throw new OneCNetworkError(url);
      throw err;
    }
  }
}
