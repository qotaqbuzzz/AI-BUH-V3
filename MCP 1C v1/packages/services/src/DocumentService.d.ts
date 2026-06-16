import type { OneCClient } from "@aibos/onec-client";
import type { OneCDocument, DocumentType } from "@aibos/onec-client";
export interface DocSearchParams {
    documentType: DocumentType;
    dateFrom?: string;
    dateTo?: string;
    contractorGuid?: string;
    posted?: boolean;
    organizationGuid?: string;
    limit?: number;
}
export interface CreateSalesInvoiceLine {
    nomenclatureGuid: string;
    qty: number;
    price: number;
    vatRateGuid?: string;
}
export interface CreateSalesInvoiceDto {
    organizationGuid: string;
    contractorGuid: string;
    contractGuid?: string;
    warehouseGuid?: string;
    date?: string;
    currencyGuid?: string;
    includeVAT?: boolean;
    includeKPN?: boolean;
    lines: CreateSalesInvoiceLine[];
}
export declare class DocumentService {
    private readonly client;
    constructor(client: OneCClient);
    searchDocuments(params: DocSearchParams): Promise<OneCDocument[]>;
    getDocument(documentType: DocumentType, guid: string): Promise<OneCDocument>;
    createDocument(entitySet: string, data: Record<string, unknown>): Promise<unknown>;
    createSalesInvoice(dto: CreateSalesInvoiceDto): Promise<{
        Ref_Key: string;
        Number: string;
        Date: string;
    }>;
    postDocument(documentType: string, guid: string): Promise<void>;
    unpostDocument(documentType: string, guid: string): Promise<void>;
}
//# sourceMappingURL=DocumentService.d.ts.map