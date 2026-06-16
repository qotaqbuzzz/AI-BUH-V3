const TABULAR_PARTS = {
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
    client;
    constructor(client) {
        this.client = client;
    }
    async searchDocuments(params) {
        const filters = [];
        if (params.dateFrom)
            filters.push(`Date ge datetime'${params.dateFrom}T00:00:00'`);
        if (params.dateTo)
            filters.push(`Date le datetime'${params.dateTo}T23:59:59'`);
        if (params.contractorGuid)
            filters.push(`Контрагент_Key eq guid'${params.contractorGuid}'`);
        if (params.posted !== undefined)
            filters.push(`Posted eq ${params.posted}`);
        if (params.organizationGuid)
            filters.push(`Организация_Key eq guid'${params.organizationGuid}'`);
        filters.push("DeletionMark eq false");
        return this.client.getCollection(`Document_${params.documentType}`, {
            filter: filters.join(" and "),
            select: "Ref_Key,Date,Number,Контрагент_Key,Организация_Key,СуммаДокумента,Posted,DeletionMark",
            orderby: "Date desc",
            top: params.limit ?? 50,
        });
    }
    async getDocument(documentType, guid) {
        const expand = TABULAR_PARTS[documentType];
        return this.client.getByKey(`Document_${documentType}`, guid, {
            expand: expand ?? undefined,
        });
    }
    async createDocument(entitySet, data) {
        return this.client.create(entitySet, data);
    }
    async createSalesInvoice(dto) {
        const lines = dto.lines.map(l => ({
            Номенклатура_Key: l.nomenclatureGuid,
            Количество: l.qty,
            Цена: l.price,
            Сумма: l.qty * l.price,
            ...(l.vatRateGuid ? { СтавкаНДС_Key: l.vatRateGuid } : {}),
        }));
        const doc = {
            Date: dto.date ?? new Date().toISOString(),
            Организация_Key: dto.organizationGuid,
            Контрагент_Key: dto.contractorGuid,
            УчитыватьНДС: dto.includeVAT ?? true,
            УчитыватьКПН: dto.includeKPN ?? false,
            СуммаВключаетНДС: true,
            Товары: lines,
        };
        if (dto.contractGuid)
            doc["ДоговорКонтрагента_Key"] = dto.contractGuid;
        if (dto.warehouseGuid)
            doc["Склад_Key"] = dto.warehouseGuid;
        if (dto.currencyGuid)
            doc["ВалютаДокумента_Key"] = dto.currencyGuid;
        return this.client.create("Document_РеализацияТоваровУслуг", doc);
    }
    async postDocument(documentType, guid) {
        return this.client.postDocument(documentType, guid);
    }
    async unpostDocument(documentType, guid) {
        return this.client.unpostDocument(documentType, guid);
    }
}
//# sourceMappingURL=DocumentService.js.map