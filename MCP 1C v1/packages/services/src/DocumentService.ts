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

const TABULAR_PARTS: Partial<Record<DocumentType, string>> = {
  РеализацияТоваровУслуг: "Товары,Услуги",
  ПоступлениеТоваровУслуг: "Товары,Услуги",
  ПлатежноеПоручениеИсходящее: "РасшифровкаПлатежа",
  ПлатежноеПоручениеВходящее: "РасшифровкаПлатежа",
  ПриходныйКассовыйОрдер: "РасшифровкаПлатежа",
  РасходныйКассовыйОрдер: "РасшифровкаПлатежа",
  ПеремещениеТоваров: "Товары",
  ТребованиеНакладная: "Материалы",
};

export class DocumentService {
  constructor(private readonly client: OneCClient) {}

  async searchDocuments(params: DocSearchParams): Promise<OneCDocument[]> {
    const filters: string[] = [];
    if (params.dateFrom) filters.push(`Date ge datetime'${params.dateFrom}T00:00:00'`);
    if (params.dateTo) filters.push(`Date le datetime'${params.dateTo}T23:59:59'`);
    if (params.contractorGuid) filters.push(`Контрагент_Key eq guid'${params.contractorGuid}'`);
    if (params.posted !== undefined) filters.push(`Posted eq ${params.posted}`);
    if (params.organizationGuid) filters.push(`Организация_Key eq guid'${params.organizationGuid}'`);
    filters.push("DeletionMark eq false");

    return this.client.getCollection<OneCDocument>(`Document_${params.documentType}`, {
      filter: filters.join(" and "),
      select: "Ref_Key,Date,Number,Контрагент_Key,Организация_Key,СуммаДокумента,Posted,DeletionMark",
      orderby: "Date desc",
      top: params.limit ?? 50,
    });
  }

  async getDocument(documentType: DocumentType, guid: string): Promise<OneCDocument> {
    const expand = TABULAR_PARTS[documentType];
    return this.client.getByKey<OneCDocument>(`Document_${documentType}`, guid, {
      expand: expand ?? undefined,
    });
  }

  async createDocument(entitySet: string, data: Record<string, unknown>): Promise<unknown> {
    return this.client.create<unknown>(entitySet, data as Partial<unknown>);
  }

  async createSalesInvoice(dto: CreateSalesInvoiceDto): Promise<{ Ref_Key: string; Number: string; Date: string }> {
    const lines = dto.lines.map(l => ({
      Номенклатура_Key: l.nomenclatureGuid,
      Количество: l.qty,
      Цена: l.price,
      Сумма: l.qty * l.price,
      ...(l.vatRateGuid ? { СтавкаНДС_Key: l.vatRateGuid } : {}),
    }));

    const doc: Record<string, unknown> = {
      Date: dto.date ?? new Date().toISOString(),
      Организация_Key: dto.organizationGuid,
      Контрагент_Key: dto.contractorGuid,
      УчитыватьНДС: dto.includeVAT ?? true,
      УчитыватьКПН: dto.includeKPN ?? false,
      СуммаВключаетНДС: true,
      Товары: lines,
    };
    if (dto.contractGuid) doc["ДоговорКонтрагента_Key"] = dto.contractGuid;
    if (dto.warehouseGuid) doc["Склад_Key"] = dto.warehouseGuid;
    if (dto.currencyGuid) doc["ВалютаДокумента_Key"] = dto.currencyGuid;

    return this.client.create<{ Ref_Key: string; Number: string; Date: string }>(
      "Document_РеализацияТоваровУслуг",
      doc as Partial<{ Ref_Key: string; Number: string; Date: string }>,
    );
  }

  async postDocument(documentType: string, guid: string): Promise<void> {
    return this.client.postDocument(documentType, guid);
  }

  async unpostDocument(documentType: string, guid: string): Promise<void> {
    return this.client.unpostDocument(documentType, guid);
  }
}
