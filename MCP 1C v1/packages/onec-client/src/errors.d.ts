export declare class OneCError extends Error {
    readonly status: number;
    readonly odataCode: string;
    readonly requestUrl?: string | undefined;
    constructor(status: number, odataCode: string, message: string, requestUrl?: string | undefined);
}
export declare class OneCAuthError extends OneCError {
    constructor(url?: string);
}
export declare class OneCForbiddenError extends OneCError {
    constructor(entity: string, url?: string);
}
export declare class OneCNotFoundError extends OneCError {
    constructor(entity: string, url?: string);
}
export declare class OneCServerError extends OneCError {
    constructor(message: string, url?: string);
}
export declare class OneCNetworkError extends OneCError {
    constructor(url?: string);
}
export declare function parseODataError(body: string): string;
export declare function createOneCError(status: number, body: string, url: string): OneCError;
//# sourceMappingURL=errors.d.ts.map