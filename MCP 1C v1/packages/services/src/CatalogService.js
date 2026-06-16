import { escapeOData } from "@aibos/onec-client";
export class CatalogService {
    client;
    constructor(client) {
        this.client = client;
    }
    async searchContractors(query, limit = 20) {
        const isInn = /^\d{9,12}$/.test(query.trim());
        const safe = escapeOData(query.trim());
        const filter = isInn
            ? `РНН eq '${safe}' or ИдентификационныйКодЛичности eq '${safe}'`
            : `contains(Description,'${safe}') or contains(НаименованиеПолное,'${safe}')`;
        return this.client.getCollection("Catalog_Контрагенты", {
            filter: `(${filter}) and DeletionMark eq false`,
            select: "Ref_Key,Description,НаименованиеПолное,РНН,ИдентификационныйКодЛичности,КБЕ,ЮрФизЛицо,НомерСвидетельстваПоНДС,DeletionMark",
            top: limit,
            orderby: "Description asc",
        });
    }
    async getContractor(guid) {
        return this.client.getByKey("Catalog_Контрагенты", guid, {
            expand: "ОсновнойДоговорКонтрагента,ОсновнойБанковскийСчет",
        });
    }
    async searchNomenclature(query, isService, limit = 20) {
        const textFilter = `contains(Description,'${escapeOData(query)}') or contains(Артикул,'${escapeOData(query)}')`;
        const serviceFilter = isService !== undefined ? ` and Услуга eq ${isService}` : "";
        return this.client.getCollection("Catalog_Номенклатура", {
            filter: `(${textFilter}) and DeletionMark eq false and IsFolder eq false${serviceFilter}`,
            select: "Ref_Key,Description,Code,Артикул,Услуга,БазоваяЕдиницаИзмерения_Key,СтавкаНДС_Key,ИдентификаторТовараЭСФ,НоменклатурнаяГруппа_Key",
            top: limit,
            orderby: "Description asc",
        });
    }
    async getOrganizations() {
        return this.client.getCollection("Catalog_Организации", {
            filter: "DeletionMark eq false",
            select: "Ref_Key,Description,НаименованиеПолное,ИдентификационныйНомер,РНН,НомерСвидетельстваПоНДС,ОсновнойБанковскийСчет_Key",
            orderby: "Description asc",
        });
    }
    async getWarehouses() {
        const rows = await this.client.getCollection("Catalog_Склады", { filter: "DeletionMark eq false", select: "Ref_Key,Description,Code", orderby: "Description asc", top: 500 }).catch(() => []);
        return rows.map(r => ({ guid: r.Ref_Key, name: r.Description ?? "", code: r.Code ?? "" }));
    }
    async getContractorContracts(contractorGuid) {
        const rows = await this.client.getCollection("Catalog_ДоговорыКонтрагентов", {
            filter: `Контрагент_Key eq guid'${contractorGuid}' and DeletionMark eq false`,
            select: "Ref_Key,Description,ВидДоговора,ВалютаВзаиморасчетов_Key,СуммаДоговора,ДатаНачала,ДатаОкончания",
            orderby: "Description asc",
            top: 200,
        }).catch(() => []);
        const currGuids = [...new Set(rows.map(r => r.ВалютаВзаиморасчетов_Key).filter(Boolean))];
        const currMap = new Map();
        if (currGuids.length) {
            const currRows = await this.client.getCollection("Catalog_Валюты", { filter: currGuids.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: currGuids.length + 5 }).catch(() => []);
            for (const c of currRows)
                currMap.set(c.Ref_Key, c.Description);
        }
        return rows.map(r => ({
            guid: r.Ref_Key,
            name: r.Description ?? "",
            contractType: r.ВидДоговора ?? "",
            currency: currMap.get(r.ВалютаВзаиморасчетов_Key ?? "") ?? "",
            amount: r.СуммаДоговора ?? 0,
            startDate: r.ДатаНачала?.slice(0, 10) ?? null,
            endDate: r.ДатаОкончания?.slice(0, 10) ?? null,
        }));
    }
}
//# sourceMappingURL=CatalogService.js.map