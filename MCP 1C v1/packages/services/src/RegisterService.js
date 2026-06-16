import { validateAccountCode } from "@aibos/onec-client";
export class RegisterService {
    client;
    accountCache = new Map();
    constructor(client) {
        this.client = client;
    }
    async resolveAccountGuid(accountCode) {
        if (this.accountCache.has(accountCode))
            return this.accountCache.get(accountCode);
        const rows = await this.client.getCollection("ChartOfAccounts_Типовой", { filter: `Code eq '${validateAccountCode(accountCode)}'`, select: "Ref_Key,Code", top: 1 });
        const guid = rows[0]?.Ref_Key ?? null;
        if (guid)
            this.accountCache.set(accountCode, guid);
        return guid;
    }
    async getAccountBalance(accountCode, organizationGuid, _date) {
        const accountGuid = await this.resolveAccountGuid(accountCode);
        if (!accountGuid)
            return { accountCode, accountGuid: "", debitBalance: 0, creditBalance: 0, netBalance: 0, quantity: 0 };
        const filters = [`Account_Key eq guid'${accountGuid}'`];
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const rows = await this.client.getRegisterBalance("AccountingRegister_Типовой", {
            filter: filters.join(" and "),
            select: "Account_Key,Организация_Key,СуммаBalanceDr,СуммаBalanceCr,СуммаBalance,КоличествоBalance",
        });
        const debitBalance = rows.reduce((s, r) => s + (r.СуммаBalanceDr ?? 0), 0);
        const creditBalance = rows.reduce((s, r) => s + (r.СуммаBalanceCr ?? 0), 0);
        const quantity = rows.reduce((s, r) => s + (r.КоличествоBalance ?? 0), 0);
        return { accountCode, accountGuid, debitBalance, creditBalance, netBalance: debitBalance - creditBalance, quantity };
    }
    async getAccountTurnovers(accountCode, dateFrom, dateTo, organizationGuid) {
        const accountGuid = await this.resolveAccountGuid(accountCode);
        if (!accountGuid)
            return { accountCode, accountGuid: "", debitTurnover: 0, creditTurnover: 0, netTurnover: 0 };
        const filters = [`Account_Key eq guid'${accountGuid}'`];
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const rows = await this.client.getRegisterTurnovers("AccountingRegister_Типовой", {
            filter: filters.join(" and "),
            StartPeriod: `${dateFrom}T00:00:00`,
            EndPeriod: `${dateTo}T23:59:59`,
            select: "Account_Key,СуммаTurnoverDr,СуммаTurnoverCr,СуммаTurnover",
        });
        const debitTurnover = rows.reduce((s, r) => s + (r.СуммаTurnoverDr ?? 0), 0);
        const creditTurnover = rows.reduce((s, r) => s + (r.СуммаTurnoverCr ?? 0), 0);
        return { accountCode, accountGuid, debitTurnover, creditTurnover, netTurnover: debitTurnover - creditTurnover };
    }
    async getExchangeRates(currencyCode, date) {
        const rows = await this.client.getSliceLast("InformationRegister_КурсыВалют", {
            ...(date ? { Period: `${date}T23:59:59` } : {}),
            expand: "Валюта",
            select: "Period,Валюта_Key,Курс,Кратность",
        });
        if (currencyCode)
            return rows.filter(r => r.Валюта?.Code === currencyCode);
        return rows;
    }
    async getContractorSettlements(contractorGuid, organizationGuid) {
        const filters = [];
        if (contractorGuid)
            filters.push(`Контрагент_Key eq guid'${contractorGuid}'`);
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        return this.client.getRegisterBalance("AccumulationRegister_ВзаиморасчетыОрганизацийСКонтрагентамиФизЛицами", {
            filter: filters.length ? filters.join(" and ") : undefined,
            select: "Контрагент_Key,Организация_Key,СуммаВзаиморасчетовBalance,ПериодВзаиморасчетов",
        });
    }
    async getAccountBreakdown(accountCode, date, organizationGuid) {
        const accountGuid = await this.resolveAccountGuid(accountCode);
        if (!accountGuid)
            return [];
        const filters = [`Account_Key eq guid'${accountGuid}'`];
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const rows = await this.client.getRegisterBalance("AccountingRegister_Типовой", {
            filter: filters.join(" and "),
            select: "СуммаBalanceDr,СуммаBalanceCr,КоличествоBalance,ExtDimension1,ExtDimension1_Type,ExtDimension2,ExtDimension2_Type",
            top: 500,
            Period: `${date}T23:59:59`,
        });
        // Catalog map for dim1 by account prefix
        const DIM1_CATALOG = {
            "1310": "Catalog_Номенклатура",
            "1320": "Catalog_Номенклатура",
            "1330": "Catalog_Номенклатура",
            "1210": "Catalog_Контрагенты",
            "1710": "Catalog_Контрагенты",
            "3310": "Catalog_Контрагенты",
            "3510": "Catalog_Контрагенты",
        };
        const DIM2_CATALOG = {
            "1310": "Catalog_Склады",
            "1320": "Catalog_Склады",
            "1330": "Catalog_Склады",
            "1210": "Catalog_ДоговорыКонтрагентов",
            "1710": "Catalog_ДоговорыКонтрагентов",
            "3310": "Catalog_ДоговорыКонтрагентов",
            "3510": "Catalog_ДоговорыКонтрагентов",
        };
        const resolveNames = async (guids, catalog) => {
            const map = new Map();
            if (!guids.length || !catalog)
                return map;
            const filter = guids.map(g => `Ref_Key eq guid'${g}'`).join(" or ");
            const items = await this.client.getCollection(catalog, {
                filter,
                select: "Ref_Key,Description",
                top: guids.length + 10,
            }).catch(() => []);
            for (const item of items)
                map.set(item.Ref_Key, item.Description);
            return map;
        };
        const dim1Guids = [...new Set(rows.map(r => r.ExtDimension1).filter(Boolean))];
        const dim2Guids = [...new Set(rows.map(r => r.ExtDimension2).filter(Boolean))];
        const [dim1Map, dim2Map] = await Promise.all([
            resolveNames(dim1Guids, DIM1_CATALOG[accountCode] ?? ""),
            resolveNames(dim2Guids, DIM2_CATALOG[accountCode] ?? ""),
        ]);
        const getName = (guid, map) => guid ? (map.get(guid) ?? guid.slice(0, 8) + "…") : "";
        return rows
            .filter(r => (r.СуммаBalanceDr ?? 0) !== 0 || (r.СуммаBalanceCr ?? 0) !== 0)
            .sort((a, b) => (b.СуммаBalanceDr ?? 0) - (a.СуммаBalanceDr ?? 0))
            .map(r => ({
            dim1: r.ExtDimension1 ?? "",
            dim1Name: getName(r.ExtDimension1, dim1Map),
            dim2: r.ExtDimension2 ?? "",
            dim2Name: getName(r.ExtDimension2, dim2Map),
            qty: r.КоличествоBalance ?? 0,
            amountDr: r.СуммаBalanceDr ?? 0,
            amountCr: r.СуммаBalanceCr ?? 0,
        }));
    }
    async getAccountCard(accountCode, dateFrom, dateTo, organizationGuid) {
        const accountGuid = await this.resolveAccountGuid(accountCode);
        if (!accountGuid)
            return { accountCode, rows: [], totals: { debitTurnover: 0, creditTurnover: 0 } };
        // 1C OData does not support (A or B) in $filter — use two separate queries
        const recPeriod = `Период ge datetime'${dateFrom}T00:00:00' and Период le datetime'${dateTo}T23:59:59'`;
        const recSelect = "Период,Регистратор,НомерСтроки,СчетДт_Key,СчетКт_Key,Сумма";
        const [drRows, crRows] = await Promise.all([
            this.client.getCollection("AccountingRegister_Типовой_RecordType", {
                filter: `СчетДт_Key eq guid'${accountGuid}' and ${recPeriod}`,
                select: recSelect,
                orderby: "Период asc,НомерСтроки asc",
                top: 2000,
            }).catch(() => []),
            this.client.getCollection("AccountingRegister_Типовой_RecordType", {
                filter: `СчетКт_Key eq guid'${accountGuid}' and ${recPeriod}`,
                select: recSelect,
                orderby: "Период asc,НомерСтроки asc",
                top: 2000,
            }).catch(() => []),
        ]);
        const rows = [...drRows, ...crRows].sort((a, b) => (a.Период ?? "").localeCompare(b.Период ?? "") || (a.НомерСтроки ?? 0) - (b.НомерСтроки ?? 0));
        const corrGuids = new Set();
        for (const r of rows) {
            if (r.СчетДт_Key && r.СчетДт_Key !== accountGuid)
                corrGuids.add(r.СчетДт_Key);
            if (r.СчетКт_Key && r.СчетКт_Key !== accountGuid)
                corrGuids.add(r.СчетКт_Key);
        }
        const accCodeMap = new Map();
        const corrGuidArr = [...corrGuids];
        for (let i = 0; i < corrGuidArr.length; i += 20) {
            const batch = corrGuidArr.slice(i, i + 20);
            const accRows = await this.client.getCollection("ChartOfAccounts_Типовой", { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Code", top: 20 }).catch(() => []);
            for (const a of accRows)
                accCodeMap.set(a.Ref_Key, a.Code ?? "");
        }
        const result = rows.map(r => {
            const isDr = r.СчетДт_Key === accountGuid;
            const corrGuid = isDr ? (r.СчетКт_Key ?? "") : (r.СчетДт_Key ?? "");
            const amt = r.Сумма ?? 0;
            return {
                period: r.Период?.slice(0, 10) ?? "",
                recorderKey: r.Регистратор ?? "",
                lineNum: r.НомерСтроки ?? 0,
                amountDr: isDr ? amt : 0,
                amountCr: isDr ? 0 : amt,
                corrAccountCode: accCodeMap.get(corrGuid) ?? corrGuid.slice(0, 8),
            };
        });
        const r2 = (n) => Math.round(n * 100) / 100;
        return {
            accountCode,
            rows: result,
            totals: {
                debitTurnover: r2(result.reduce((s, r) => s + r.amountDr, 0)),
                creditTurnover: r2(result.reduce((s, r) => s + r.amountCr, 0)),
            },
        };
    }
    async getInventoryBalance(organizationGuid, nomenclatureGuid, _date) {
        const filters = [];
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        if (nomenclatureGuid)
            filters.push(`Номенклатура_Key eq guid'${nomenclatureGuid}'`);
        return this.client.getRegisterBalance("AccumulationRegister_ТоварыОрганизацийБУ", { filter: filters.length ? filters.join(" and ") : undefined });
    }
}
//# sourceMappingURL=RegisterService.js.map