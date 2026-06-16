import { validateAccountCode } from "@aibos/onec-client";
const r2 = (n) => Math.round(n * 100) / 100;
// Catalogs tried in order when resolving subconto GUIDs
const DIM_CATALOGS = [
    "Catalog_Номенклатура",
    "Catalog_Контрагенты",
    "Catalog_Подразделения",
    "Catalog_Склады",
    "Catalog_СтатьиЗатрат",
    "Catalog_ФизическиеЛица",
    "Catalog_ДоговорыКонтрагентов",
    "Catalog_ВидыОперацийДвиженияДенежныхСредств",
];
function buildMonthRange(dateFrom, dateTo) {
    const months = [];
    const parts0 = dateFrom.split("-");
    const parts1 = dateTo.split("-");
    let y = parseInt(parts0[0] ?? "2025", 10);
    let m = parseInt(parts0[1] ?? "1", 10);
    const yEnd = parseInt(parts1[0] ?? "2025", 10);
    const mEnd = parseInt(parts1[1] ?? "12", 10);
    while (y < yEnd || (y === yEnd && m <= mEnd)) {
        const label = `${y}-${String(m).padStart(2, "0")}`;
        const lastDay = new Date(y, m, 0).getDate();
        months.push({ label, from: `${label}-01`, to: `${label}-${String(lastDay).padStart(2, "0")}` });
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }
    return months;
}
export class AccountAnalysisService {
    client;
    constructor(client) {
        this.client = client;
    }
    async resolveAccount(accountCode) {
        const rows = await this.client.getCollection("ChartOfAccounts_Типовой", { filter: `Code eq '${validateAccountCode(accountCode)}'`, select: "Ref_Key,Code,Description", top: 1 }).catch(() => []);
        if (!rows[0])
            return null;
        return { guid: rows[0].Ref_Key, name: rows[0].Description ?? accountCode };
    }
    async resolveAccountCodes(guids) {
        const map = new Map();
        const unique = [...new Set(guids.filter(g => g && g !== "__unknown__"))];
        for (let i = 0; i < unique.length; i += 20) {
            const batch = unique.slice(i, i + 20);
            const rows = await this.client.getCollection("ChartOfAccounts_Типовой", { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Code,Description", top: 20 }).catch(() => []);
            for (const r of rows)
                map.set(r.Ref_Key, { code: r.Code ?? "", name: r.Description ?? "" });
        }
        return map;
    }
    async resolveDimNames(guids) {
        const map = new Map();
        const unique = [...new Set(guids.filter(Boolean))];
        if (!unique.length)
            return map;
        for (let i = 0; i < unique.length; i += 10) {
            const batch = unique.slice(i, i + 10);
            const remaining = batch.filter(g => !map.has(g));
            if (!remaining.length)
                continue;
            const filter = remaining.map(g => `Ref_Key eq guid'${g}'`).join(" or ");
            for (const catalog of DIM_CATALOGS) {
                if (remaining.every(g => map.has(g)))
                    break;
                const rows = await this.client.getCollection(catalog, { filter, select: "Ref_Key,Description", top: remaining.length }).catch(() => []);
                for (const r of rows)
                    if (!map.has(r.Ref_Key))
                        map.set(r.Ref_Key, r.Description ?? "");
            }
        }
        return map;
    }
    async analyzeAccount(accountCode, dateFrom, dateTo, organizationGuid) {
        const acc = await this.resolveAccount(accountCode);
        if (!acc) {
            return {
                accountCode, accountName: `Счёт ${accountCode} не найден`,
                period: { from: dateFrom, to: dateTo },
                summary: { openingBalance: 0, debitTurnover: 0, creditTurnover: 0, closingBalance: 0 },
                byCorrAccount: [], bySubconto: [], monthlyTrend: [],
                meta: { recordsScanned: 0, corrAccountTruncated: false },
            };
        }
        const orgFilter = organizationGuid ? ` and Организация_Key eq guid'${organizationGuid}'` : "";
        const periodFrom = `${dateFrom}T00:00:00`;
        const periodTo = `${dateTo}T23:59:59`;
        const RECORD_LIMIT = 5000;
        // ── 1. Summary via BalanceAndTurnovers ────────────────────────────────────
        const summaryRows = await this.client.getBalanceAndTurnovers("AccountingRegister_Типовой", {
            filter: `Account_Key eq guid'${acc.guid}'${orgFilter}`,
            select: "СуммаOpeningBalanceDr,СуммаOpeningBalanceCr,СуммаTurnoverDr,СуммаTurnoverCr,СуммаClosingBalanceDr,СуммаClosingBalanceCr",
            StartPeriod: periodFrom,
            EndPeriod: periodTo,
        }).catch(() => []);
        const openDr = summaryRows.reduce((s, r) => s + (r.СуммаOpeningBalanceDr ?? 0), 0);
        const openCr = summaryRows.reduce((s, r) => s + (r.СуммаOpeningBalanceCr ?? 0), 0);
        const turnDr = summaryRows.reduce((s, r) => s + (r.СуммаTurnoverDr ?? 0), 0);
        const turnCr = summaryRows.reduce((s, r) => s + (r.СуммаTurnoverCr ?? 0), 0);
        const closeDr = summaryRows.reduce((s, r) => s + (r.СуммаClosingBalanceDr ?? 0), 0);
        const closeCr = summaryRows.reduce((s, r) => s + (r.СуммаClosingBalanceCr ?? 0), 0);
        const recPeriod = `Период ge datetime'${periodFrom}' and Период le datetime'${periodTo}'`;
        const [drRecs, crRecs] = await Promise.all([
            this.client.getCollection("AccountingRegister_Типовой_RecordType", {
                filter: `СчетДт_Key eq guid'${acc.guid}' and ${recPeriod}`,
                select: "СчетДт_Key,СчетКт_Key,Сумма",
                top: RECORD_LIMIT,
            }).catch(() => []),
            this.client.getCollection("AccountingRegister_Типовой_RecordType", {
                filter: `СчетКт_Key eq guid'${acc.guid}' and ${recPeriod}`,
                select: "СчетДт_Key,СчетКт_Key,Сумма",
                top: RECORD_LIMIT,
            }).catch(() => []),
        ]);
        const corrMap = new Map();
        for (const r of drRecs) {
            const k = r.СчетКт_Key ?? "__unknown__";
            const g = corrMap.get(k) ?? { dr: 0, cr: 0 };
            g.dr += r.Сумма ?? 0;
            corrMap.set(k, g);
        }
        for (const r of crRecs) {
            const k = r.СчетДт_Key ?? "__unknown__";
            const g = corrMap.get(k) ?? { dr: 0, cr: 0 };
            g.cr += r.Сумма ?? 0;
            corrMap.set(k, g);
        }
        const corrGuids = [...corrMap.keys()].filter(g => g !== "__unknown__");
        const corrNameMap = await this.resolveAccountCodes(corrGuids);
        const byCorrAccount = [...corrMap.entries()]
            .map(([guid, v]) => {
            const info = corrNameMap.get(guid);
            const label = info ? `${info.code} ${info.name}`.trim() : (guid === "__unknown__" ? "Не определён" : guid.slice(0, 8) + "…");
            return {
                corrAccount: info?.code ?? "",
                corrAccountName: label,
                turnoverDr: r2(v.dr),
                turnoverCr: r2(v.cr),
                shareDrPct: turnDr > 0 ? Math.round((v.dr / turnDr) * 100) : 0,
                shareCrPct: turnCr > 0 ? Math.round((v.cr / turnCr) * 100) : 0,
            };
        })
            .sort((a, b) => (b.turnoverDr + b.turnoverCr) - (a.turnoverDr + a.turnoverCr));
        const balRows = await this.client.getRegisterBalance("AccountingRegister_Типовой", {
            filter: `Account_Key eq guid'${acc.guid}'${orgFilter}`,
            select: "ExtDimension1,ExtDimension2,ExtDimension3,СуммаBalanceDr,СуммаBalanceCr",
            top: 2000,
            Period: `${dateTo}T23:59:59`,
        }).catch(() => []);
        const dimGuids = [
            ...new Set([
                ...balRows.map(r => r.ExtDimension1).filter(Boolean),
                ...balRows.map(r => r.ExtDimension2).filter(Boolean),
                ...balRows.map(r => r.ExtDimension3).filter(Boolean),
            ]),
        ];
        const dimNameMap = await this.resolveDimNames(dimGuids);
        const getName = (guid) => guid ? (dimNameMap.get(guid) ?? guid.slice(0, 8) + "…") : "";
        const bySubconto = balRows
            .filter(r => (r.СуммаBalanceDr ?? 0) !== 0 || (r.СуммаBalanceCr ?? 0) !== 0)
            .map(r => ({
            dim1: r.ExtDimension1 ?? "",
            dim1Name: getName(r.ExtDimension1),
            dim2: r.ExtDimension2 ?? "",
            dim2Name: getName(r.ExtDimension2),
            balanceDr: r2(r.СуммаBalanceDr ?? 0),
            balanceCr: r2(r.СуммаBalanceCr ?? 0),
            net: r2((r.СуммаBalanceDr ?? 0) - (r.СуммаBalanceCr ?? 0)),
        }))
            .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
        // ── 4. Monthly trend ──────────────────────────────────────────────────────
        const months = buildMonthRange(dateFrom, dateTo);
        const monthlyTrend = await Promise.all(months.map(async ({ label, from, to }) => {
            const rows = await this.client.getBalanceAndTurnovers("AccountingRegister_Типовой", {
                filter: `Account_Key eq guid'${acc.guid}'${orgFilter}`,
                select: "СуммаTurnoverDr,СуммаTurnoverCr,СуммаClosingBalanceDr,СуммаClosingBalanceCr",
                StartPeriod: `${from}T00:00:00`,
                EndPeriod: `${to}T23:59:59`,
            }).catch(() => []);
            const tDr = r2(rows.reduce((s, r) => s + (r.СуммаTurnoverDr ?? 0), 0));
            const tCr = r2(rows.reduce((s, r) => s + (r.СуммаTurnoverCr ?? 0), 0));
            const cDr = rows.reduce((s, r) => s + (r.СуммаClosingBalanceDr ?? 0), 0);
            const cCr = rows.reduce((s, r) => s + (r.СуммаClosingBalanceCr ?? 0), 0);
            return { month: label, turnoverDr: tDr, turnoverCr: tCr, closingBalance: r2(cDr - cCr) };
        }));
        return {
            accountCode,
            accountName: acc.name,
            period: { from: dateFrom, to: dateTo },
            summary: {
                openingBalance: r2(openDr - openCr),
                debitTurnover: r2(turnDr),
                creditTurnover: r2(turnCr),
                closingBalance: r2(closeDr - closeCr),
            },
            byCorrAccount,
            bySubconto,
            monthlyTrend,
            meta: {
                recordsScanned: drRecs.length + crRecs.length,
                corrAccountTruncated: drRecs.length >= RECORD_LIMIT || crRecs.length >= RECORD_LIMIT,
            },
        };
    }
}
//# sourceMappingURL=AccountAnalysisService.js.map