import type { OneCConfig, ODataQueryParams } from "./types.js";
export declare function wrapGuid(guid: string): string;
export declare function buildQueryString(params: ODataQueryParams): string;
export declare class OneCClient {
    private readonly baseUrl;
    private readonly authHeader;
    private readonly timeoutMs;
    private readonly maxRetries;
    constructor(config: OneCConfig);
    private request;
    getCollection<T>(entitySet: string, params?: ODataQueryParams): Promise<T[]>;
    getByKey<T>(entitySet: string, guid: string, params?: ODataQueryParams): Promise<T>;
    create<T>(entitySet: string, data: Partial<T>): Promise<T>;
    update(entitySet: string, guid: string, data: Record<string, unknown>): Promise<void>;
    delete(entitySet: string, guid: string): Promise<void>;
    postDocument(documentType: string, guid: string): Promise<void>;
    unpostDocument(documentType: string, guid: string): Promise<void>;
    getRegisterBalance<T>(registerName: string, params?: ODataQueryParams & {
        Condition?: string;
        Period?: string;
    }): Promise<T[]>;
    getRegisterTurnovers<T>(registerName: string, params?: ODataQueryParams & {
        Condition?: string;
        StartPeriod?: string;
        EndPeriod?: string;
    }): Promise<T[]>;
    getBalanceAndTurnovers<T>(registerName: string, params?: ODataQueryParams & {
        Condition?: string;
        StartPeriod?: string;
        EndPeriod?: string;
    }): Promise<T[]>;
    getSliceLast<T>(registerName: string, params?: ODataQueryParams & {
        Condition?: string;
        Period?: string;
    }): Promise<T[]>;
    private getCollectionWithSuffix;
    getMetadata(): Promise<string>;
}
//# sourceMappingURL=OneCClient.d.ts.map