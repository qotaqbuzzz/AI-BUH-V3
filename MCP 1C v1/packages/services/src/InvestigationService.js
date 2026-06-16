/**
 * InvestigationService — раскрывает цепочку платёж → сотрудник → банковский счёт.
 *
 * Инкапсулирует 8-10 запросов в 1С в два метода:
 *   investigatePayment()  — полный анализ одного платёжного документа
 *   findDuplicatePairs()  — найти дубли по дате и вернуть с именами
 */
import { escapeOData } from "@aibos/onec-client";
// ── Service ───────────────────────────────────────────────────────
export class InvestigationService {
    client;
    constructor(client) {
        this.client = client;
    }
    // ── 1. Полное расследование одного платежа ────────────────────
    async investigatePayment(docNumber, docDate, // YYYY-MM-DD
    orgGuid) {
        // Загрузить платёжный документ
        const dateFilter = `Date ge datetime'${docDate}T00:00:00' and Date le datetime'${docDate}T23:59:59'`;
        const doc = await this.client
            .getCollection("Document_ПлатежноеПоручениеИсходящее", {
            filter: `Number eq '${escapeOData(docNumber)}' and (${dateFilter})`,
            top: 1,
        })
            .then(r => r[0])
            .catch(() => undefined);
        if (!doc) {
            return this.notFound(docNumber, docDate);
        }
        // Параллельно: банковский счёт + контрагент + ведомость
        const [orgAcc, contractor, employee] = await Promise.all([
            this.resolveOrgAccount(doc.СчетОрганизации_Key),
            this.resolveContractor(doc.Контрагент_Key),
            this.resolveEmployee(doc.ПеречислениеЗаработнойПлаты ?? []),
        ]);
        const verdict = this.buildVerdict(doc, employee);
        const riskLevel = this.calcRisk(doc, employee);
        return {
            doc: {
                number: doc.Number,
                date: doc.Date?.slice(0, 10) ?? docDate,
                amount: doc.СуммаДокумента ?? 0,
                purpose: doc.НазначениеПлатежа ?? "",
                comment: doc.Комментарий ?? "",
                posted: doc.Posted ?? false,
            },
            orgAccount: orgAcc,
            recipient: {
                name: contractor ?? doc.ТекстПолучателя ?? "—",
                inn: doc.РННПолучателя ?? "—",
            },
            employee,
            verdict,
            riskLevel,
        };
    }
    // ── 2. Найти дубли за период и обогатить именами ─────────────
    async findDuplicatePairs(orgGuid, dateFrom, dateTo, windowHours = 24) {
        const docs = await this.client
            .getCollection("Document_ПлатежноеПоручениеИсходящее", {
            filter: [
                `DeletionMark eq false`,
                `Организация_Key eq guid'${orgGuid}'`,
                `Date ge datetime'${dateFrom}T00:00:00'`,
                `Date le datetime'${dateTo}T23:59:59'`,
            ].join(" and "),
            select: "Ref_Key,Number,Date,СуммаДокумента,Контрагент_Key,НазначениеПлатежа,СчетОрганизации_Key,ПеречислениеЗаработнойПлаты",
            top: 2000,
        })
            .catch(() => []);
        // Собрать уникальные GUID контрагентов
        const kaGuids = [...new Set(docs.map(d => d.Контрагент_Key).filter(Boolean))];
        const kaMap = await this.batchNames(kaGuids, "Catalog_Контрагенты");
        // Найти пары
        const pairs = [];
        const sorted = [...docs].sort((a, b) => (a.Date ?? "").localeCompare(b.Date ?? ""));
        for (let i = 0; i < sorted.length; i++) {
            const a = sorted[i];
            for (let j = i + 1; j < sorted.length; j++) {
                const b = sorted[j];
                const diffH = (new Date(b.Date).getTime() - new Date(a.Date).getTime()) / 3_600_000;
                if (diffH > windowHours)
                    break;
                if (a.СуммаДокумента !== b.СуммаДокумента)
                    continue;
                if (a.Контрагент_Key !== b.Контрагент_Key)
                    continue;
                if (a.Ref_Key === b.Ref_Key)
                    continue;
                const samePurpose = (a.НазначениеПлатежа ?? "").trim() === (b.НазначениеПлатежа ?? "").trim();
                const sameAccount = a.СчетОрганизации_Key === b.СчетОрганизации_Key;
                // Если есть ведомость — достать ФИО
                let employeeName;
                let sameEmployee = false;
                const vedA = a.ПеречислениеЗаработнойПлаты?.[0]?.Ведомость_Key;
                const vedB = b.ПеречислениеЗаработнойПлаты?.[0]?.Ведомость_Key;
                if (vedA || vedB) {
                    const emp = await this.resolveEmployee((vedA ? [{ Ведомость_Key: vedA }] : vedB ? [{ Ведомость_Key: vedB }] : []));
                    if (emp.found) {
                        employeeName = emp.fullName;
                        sameEmployee = vedA === vedB && !!vedA;
                    }
                }
                const riskLevel = (samePurpose && sameAccount) || sameEmployee ? "high" : "medium";
                const recommendation = riskLevel === "high"
                    ? `Проверить выписку банка — возможно двойное списание. Отменить лишний документ в 1С.`
                    : `Уточнить у бухгалтера — разные основания для одной суммы. Возможно два разных получателя.`;
                pairs.push({
                    docA: a.Number,
                    docB: b.Number,
                    date: a.Date?.slice(0, 10) ?? "",
                    amount: a.СуммаДокумента ?? 0,
                    contractorName: kaMap.get(a.Контрагент_Key ?? "") ?? "—",
                    purposeA: a.НазначениеПлатежа ?? "",
                    purposeB: b.НазначениеПлатежа ?? "",
                    sameAccount,
                    sameEmployee,
                    employeeName,
                    riskLevel,
                    recommendation,
                });
            }
        }
        return pairs.sort((a, b) => (a.riskLevel === "high" ? 0 : 1) - (b.riskLevel === "high" ? 0 : 1)
            || b.amount - a.amount);
    }
    // ── Private helpers ───────────────────────────────────────────
    async resolveOrgAccount(guid) {
        const empty = { guid: guid ?? "—", accountNumber: "—", description: "—", bank: "—" };
        if (!guid || guid === "00000000-0000-0000-0000-000000000000")
            return empty;
        const rows = await this.client
            .getCollection("Catalog_БанковскиеСчета", {
            filter: `Ref_Key eq guid'${guid}'`,
            select: "НомерСчета,Description,Банк_Key",
            top: 1,
        })
            .catch(() => []);
        if (!rows.length)
            return empty;
        let bankName = "";
        if (rows[0].Банк_Key && rows[0].Банк_Key !== "00000000-0000-0000-0000-000000000000") {
            const b = await this.client
                .getCollection("Catalog_Банки", {
                filter: `Ref_Key eq guid'${rows[0].Банк_Key}'`,
                select: "Description",
                top: 1,
            })
                .catch(() => []);
            bankName = b[0]?.Description ?? "";
        }
        return {
            guid,
            accountNumber: rows[0].НомерСчета ?? "—",
            description: rows[0].Description ?? "—",
            bank: bankName,
        };
    }
    async resolveContractor(guid) {
        if (!guid || guid === "00000000-0000-0000-0000-000000000000")
            return undefined;
        const rows = await this.client
            .getCollection("Catalog_Контрагенты", {
            filter: `Ref_Key eq guid'${guid}'`,
            select: "Description",
            top: 1,
        })
            .catch(() => []);
        return rows[0]?.Description;
    }
    async resolveEmployee(zpRows) {
        const vedKey = zpRows[0]?.Ведомость_Key;
        if (!vedKey || vedKey === "00000000-0000-0000-0000-000000000000") {
            return { found: false };
        }
        const veds = await this.client
            .getCollection("Document_ЗарплатаКВыплатеОрганизаций", {
            filter: `Ref_Key eq guid'${vedKey}'`,
            top: 1,
        })
            .catch(() => []);
        if (!veds.length)
            return { found: false };
        const ved = veds[0];
        const fizKey = ved.Зарплата?.[0]?.Физлицо_Key;
        let fullName = ved.КраткийСоставДокумента ?? "";
        let birthDate = "";
        if (fizKey && fizKey !== "00000000-0000-0000-0000-000000000000") {
            const fiz = await this.client
                .getCollection("Catalog_ФизическиеЛица", {
                filter: `Ref_Key eq guid'${fizKey}'`,
                select: "Description,ДатаРождения",
                top: 1,
            })
                .catch(() => []);
            if (fiz.length) {
                fullName = fiz[0].Description ?? fullName;
                birthDate = fiz[0].ДатаРождения?.slice(0, 10) ?? "";
            }
        }
        return {
            found: true,
            fullName,
            birthDate,
            fizGuid: fizKey,
            vedNumber: ved.Number,
            vedDate: ved.Date?.slice(0, 10),
            vedPosted: ved.Posted,
            payAmount: ved.СуммаДокумента,
        };
    }
    buildVerdict(doc, employee) {
        const parts = [];
        if (!doc.Posted)
            parts.push("⚠ Документ НЕ проведён — проводки не созданы");
        if (employee.found) {
            parts.push(`Получатель: ${employee.fullName} (д.р. ${employee.birthDate})`);
            if (!employee.vedPosted)
                parts.push("⚠ Ведомость не проведена, но платёжка оплачена — возможный дубль");
        }
        else {
            parts.push("Получатель — юрлицо или внутренний перевод");
        }
        return parts.join(" | ");
    }
    calcRisk(doc, employee) {
        if (employee.found && !employee.vedPosted)
            return "high";
        if (!doc.Posted)
            return "medium";
        return "low";
    }
    notFound(number, date) {
        return {
            doc: { number, date, amount: 0, purpose: "", comment: "", posted: false },
            orgAccount: { guid: "—", accountNumber: "—", description: "—", bank: "—" },
            recipient: { name: "Не найден", inn: "—" },
            employee: { found: false },
            verdict: `Документ ${number} за ${date} не найден в ПлатежноеПоручениеИсходящее`,
            riskLevel: "none",
        };
    }
    async batchNames(guids, entity, field = "Description") {
        const map = new Map();
        const BATCH = 15;
        for (let i = 0; i < guids.length; i += BATCH) {
            const chunk = guids.slice(i, i + BATCH);
            const f = chunk.map(g => `Ref_Key eq guid'${g}'`).join(" or ");
            const rows = await this.client
                .getCollection(entity, { filter: f, select: `Ref_Key,${field}`, top: BATCH })
                .catch(() => []);
            for (const r of rows)
                map.set(r.Ref_Key, String(r[field] ?? ""));
        }
        return map;
    }
}
//# sourceMappingURL=InvestigationService.js.map