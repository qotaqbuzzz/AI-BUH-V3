export class AuditorService {
    client;
    docs;
    constructor(client, docs) {
        this.client = client;
        this.docs = docs;
    }
    async getDocumentJournalEntries(documentGuid) {
        return this.client.getCollection("AccountingRegister_Типовой_RecordType", {
            filter: `Регистратор eq guid'${documentGuid}'`,
            orderby: "НомерСтроки asc",
            top: 500,
        }).catch(() => []);
    }
    async getESFStatus(organizationGuid, dateFrom, dateTo) {
        return this.client.getCollection("InformationRegister_АктуальныеЭСФ", {
            filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
            top: 500,
        }).catch(() => []);
    }
    async getUnpostedDocuments(documentType, dateFrom, dateTo, organizationGuid) {
        const filters = [
            `Posted eq false`,
            `DeletionMark eq false`,
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        return this.client.getCollection(`Document_${documentType}`, {
            filter: filters.join(" and "),
            select: "Ref_Key,Number,Date,Контрагент_Key,Организация_Key,СуммаДокумента,Posted",
            orderby: "Date desc",
            top: 200,
        });
    }
    async auditPeriodQuality(organizationGuid, year, month, register, reports) {
        const pad = (n) => String(n).padStart(2, "0");
        const dateFrom = `${year}-${pad(month)}-01`;
        // Use getDate() to avoid UTC timezone shift (e.g. UTC+5 converts midnight → prev day in ISO)
        const lastDayNum = new Date(year, month, 0).getDate();
        const lastDay = `${year}-${pad(month)}-${pad(lastDayNum)}`;
        const MONTHS_RU = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        const periodLabel = `${MONTHS_RU[month - 1]} ${year}`;
        const checks = [];
        const chk = (block, blockName, status, message, value) => ({ block, blockName, status, message, value });
        // Organization name
        const orgRows = await this.client.getCollection("Catalog_Организации", { filter: `Ref_Key eq guid'${organizationGuid}'`, select: "Ref_Key,Description", top: 1 }).catch(() => []);
        const organizationName = orgRows[0]?.Description ?? organizationGuid;
        // ── БЛОК 1: ПОЛНОТА ──────────────────────────────────────────────────────────
        // 1.1 ЗакрытиеМесяца
        const closeStatus = await this.getMonthCloseStatus(organizationGuid, year, month);
        if (!closeStatus.found) {
            checks.push(chk(1, "ПОЛНОТА", "error", "ЗакрытиеМесяца: документ НЕ НАЙДЕН"));
        }
        else if (!closeStatus.posted) {
            checks.push(chk(1, "ПОЛНОТА", "warn", "ЗакрытиеМесяца: найден, но НЕ ПРОВЕДЁН"));
        }
        else {
            checks.push(chk(1, "ПОЛНОТА", "ok", `ЗакрытиеМесяца: проведён (${closeStatus.date?.slice(0, 10)})`));
        }
        // 1.2 Непроведённые документы
        const unpostedByType = await Promise.all(["РеализацияТоваровУслуг", "ПоступлениеТоваровУслуг", "ПлатежноеПоручениеИсходящее", "ПлатежноеПоручениеВходящее"].map(t => this.getUnpostedDocuments(t, dateFrom, lastDay, organizationGuid).then(r => ({ type: t, count: r.length }))));
        const totalUnposted = unpostedByType.reduce((s, r) => s + r.count, 0);
        const unpostedDetail = unpostedByType.filter(r => r.count > 0).map(r => `${r.type}:${r.count}`).join(", ");
        if (totalUnposted === 0) {
            checks.push(chk(1, "ПОЛНОТА", "ok", "Непроведённых документов: 0"));
        }
        else {
            checks.push(chk(1, "ПОЛНОТА", "error", `Непроведённых документов: ${totalUnposted} (${unpostedDetail})`, totalUnposted));
        }
        // 1.3 НачислениеЗарплаты
        const salaryDocs = await this.client.getCollection("Document_НачислениеЗарплатыРаботникамОрганизаций", {
            filter: `Организация_Key eq guid'${organizationGuid}' and Posted eq true and DeletionMark eq false and Date ge datetime'${dateFrom}T00:00:00' and Date le datetime'${lastDay}T23:59:59'`,
            select: "Ref_Key",
            top: 10,
        }).catch(() => []);
        if (salaryDocs.length === 0) {
            checks.push(chk(1, "ПОЛНОТА", "warn", "НачислениеЗарплаты: документов НЕ НАЙДЕНО за период"));
        }
        else {
            checks.push(chk(1, "ПОЛНОТА", "ok", `НачислениеЗарплаты: ${salaryDocs.length} документ(ов) проведено`));
        }
        // ── БЛОК 2: ОШИБКИ И ИСПРАВЛЕНИЯ ────────────────────────────────────────────
        // 2.1 ОперацияБух (ручные проводки)
        const manualEntries = await this.client.getCollection("Document_ОперацияБух", {
            filter: `Организация_Key eq guid'${organizationGuid}' and DeletionMark eq false and Date ge datetime'${dateFrom}T00:00:00' and Date le datetime'${lastDay}T23:59:59'`,
            select: "Ref_Key,Date,Number,СуммаДокумента",
            top: 500,
        }).catch(() => []);
        const manualTotal = manualEntries.reduce((s, r) => s + (r.СуммаДокумента ?? 0), 0);
        const fmtN = (n) => Math.round(n).toLocaleString("ru-RU");
        if (manualEntries.length === 0) {
            checks.push(chk(2, "ОШИБКИ", "ok", "Ручных проводок ОперацияБух: 0"));
        }
        else if (manualEntries.length <= 5) {
            checks.push(chk(2, "ОШИБКИ", "warn", `ОперацияБух: ${manualEntries.length} шт. на ${fmtN(manualTotal)} тг`, manualEntries.length));
        }
        else {
            checks.push(chk(2, "ОШИБКИ", "error", `ОперацияБух: ${manualEntries.length} шт. — МНОГО, сумма ${fmtN(manualTotal)} тг`, manualEntries.length));
        }
        // 2.2 Ночные / внерабочие проводки (до 07:00 или после 19:00)
        const nightEntries = manualEntries.filter(r => {
            try {
                const h = new Date(r.Date).getHours();
                return h < 7 || h >= 19;
            }
            catch {
                return false;
            }
        });
        if (nightEntries.length > 0) {
            checks.push(chk(2, "ОШИБКИ", "warn", `ОперацияБух вне рабочего времени (07–19ч): ${nightEntries.length} шт.`, nightEntries.length));
        }
        // 2.3 Круглые суммы ≥ 1 млн кратно 1 млн
        const roundBatches = await Promise.all(["РеализацияТоваровУслуг", "ПоступлениеТоваровУслуг", "ОперацияБух"].map(dt => this.client.getCollection(`Document_${dt}`, {
            filter: `Организация_Key eq guid'${organizationGuid}' and DeletionMark eq false and Date ge datetime'${dateFrom}T00:00:00' and Date le datetime'${lastDay}T23:59:59'`,
            select: "Ref_Key,СуммаДокумента",
            top: 1000,
        }).then(rows => rows.filter(r => { const a = r.СуммаДокумента ?? 0; return a >= 1_000_000 && a % 1_000_000 === 0; })).catch(() => [])));
        const roundCount = roundBatches.reduce((s, r) => s + r.length, 0);
        if (roundCount === 0) {
            checks.push(chk(2, "ОШИБКИ", "ok", "Подозрительно круглых сумм (≥1 млн, кратно млн): 0"));
        }
        else {
            checks.push(chk(2, "ОШИБКИ", "warn", `Круглых сумм ≥1 млн: ${roundCount} документов — проверить обоснованность`, roundCount));
        }
        // ── БЛОК 3: КОРРЕКТНОСТЬ ОСТАТКОВ ────────────────────────────────────────────
        const osv = await reports.getOSV(dateFrom, lastDay, organizationGuid);
        // 3.1 Дт = Кт
        const dtktDiff = Math.abs(osv.totals.turnDr - osv.totals.turnCr);
        if (dtktDiff < 1) {
            checks.push(chk(3, "ОСТАТКИ", "ok", `ОСВ Дт = Кт: сбалансировано (оборот ${fmtN(osv.totals.turnDr)} тг)`));
        }
        else {
            checks.push(chk(3, "ОСТАТКИ", "error", `ОСВ РАЗБАЛАНСИРОВАНА: разница Дт−Кт = ${fmtN(dtktDiff)} тг`, dtktDiff));
        }
        // 3.2 Красное сторно — отрицательные обороты по счетам
        const stornoRows = osv.rows.filter(r => r.turnoverDr < 0 || r.turnoverCr < 0);
        if (stornoRows.length === 0) {
            checks.push(chk(3, "ОСТАТКИ", "ok", "Красного сторно не обнаружено"));
        }
        else {
            const detail = stornoRows.slice(0, 4).map(r => `${r.accountCode}(${r.turnoverDr < 0 ? "Дт " + fmtN(r.turnoverDr) : "Кт " + fmtN(r.turnoverCr)})`).join(", ");
            checks.push(chk(3, "ОСТАТКИ", "warn", `Сторно (отриц. обороты): ${stornoRows.length} счётов — ${detail}`, stornoRows.length));
        }
        // 3.3 Нетипичные знаки остатков
        const atypical = [];
        for (const r of osv.rows) {
            const code = r.accountCode;
            const net = r.closingDr - r.closingCr;
            if ((code.startsWith("1") || code.startsWith("2") || code.startsWith("8")) && net < -1000 && !["1420"].includes(code)) {
                atypical.push(`${code}: Кт ${fmtN(-net)} тг`);
            }
            if (code.startsWith("3") && net > 1000 && !["3110", "3120", "3130"].includes(code)) {
                atypical.push(`${code}: Дт ${fmtN(net)} тг`);
            }
        }
        if (atypical.length === 0) {
            checks.push(chk(3, "ОСТАТКИ", "ok", "Нетипичных остатков не обнаружено"));
        }
        else {
            const statusVal = atypical.length > 3 ? "error" : "warn";
            checks.push(chk(3, "ОСТАТКИ", statusVal, `Нетипичные остатки (${atypical.length}): ${atypical.slice(0, 4).join("; ")}`, atypical.length));
        }
        // 3.4 Счёт 8110 НЗП — сезонная проверка
        const row8110 = osv.rows.find(r => r.accountCode === "8110");
        const bal8110 = row8110 ? (row8110.closingDr - row8110.closingCr) : 0;
        const seasonCheck = (() => {
            if (month <= 3)
                return bal8110 > 100_000
                    ? chk(3, "ОСТАТКИ", "warn", `8110 НЗП = ${fmtN(bal8110)} тг (зима — ожидается 0 до посевной)`, bal8110)
                    : chk(3, "ОСТАТКИ", "ok", `8110 НЗП = 0 (зима/до посевной — норм.)`);
            if (month <= 7)
                return bal8110 > 0
                    ? chk(3, "ОСТАТКИ", "ok", `8110 НЗП = ${fmtN(bal8110)} тг (посевная/рост — накопление норм.)`)
                    : chk(3, "ОСТАТКИ", "warn", `8110 НЗП = 0 (посевная — затраты не начаты?)`);
            if (month <= 9)
                return bal8110 > 5_000_000
                    ? chk(3, "ОСТАТКИ", "warn", `8110 НЗП = ${fmtN(bal8110)} тг (уборка — урожай оприходован в 1320??)`, bal8110)
                    : chk(3, "ОСТАТКИ", "ok", `8110 НЗП = ${fmtN(bal8110)} тг (уборка — закрывается в 1320)`);
            return bal8110 > 100_000
                ? chk(3, "ОСТАТКИ", "warn", `8110 НЗП = ${fmtN(bal8110)} тг (послеуборочный — ожидается 0)`, bal8110)
                : chk(3, "ОСТАТКИ", "ok", `8110 НЗП = 0 (норм.)`);
        })();
        checks.push(seasonCheck);
        // 3.5 Банк 1030 — нет ли минуса
        const b1030 = await register.getAccountBalance("1030", organizationGuid, lastDay).catch(() => null);
        if (b1030) {
            if (b1030.netBalance < 0) {
                checks.push(chk(3, "ОСТАТКИ", "error", `Счёт 1030 Банк: ОТРИЦАТЕЛЬНЫЙ остаток ${fmtN(b1030.netBalance)} тг`, b1030.netBalance));
            }
            else {
                checks.push(chk(3, "ОСТАТКИ", "ok", `Счёт 1030 Банк: ${fmtN(b1030.netBalance)} тг`));
            }
        }
        // ── БЛОК 4: НАЛОГОВАЯ ДИСЦИПЛИНА ─────────────────────────────────────────────
        const [t3130, t6010, b3350, b3210] = await Promise.all([
            register.getAccountTurnovers("3130", dateFrom, lastDay, organizationGuid).catch(() => null),
            register.getAccountTurnovers("6010", dateFrom, lastDay, organizationGuid).catch(() => null),
            register.getAccountBalance("3350", organizationGuid, lastDay).catch(() => null),
            register.getAccountBalance("3210", organizationGuid, lastDay).catch(() => null),
        ]);
        // 4.1 НДС
        const rev = t6010?.creditTurnover ?? 0;
        const vatCharged = t3130?.creditTurnover ?? 0;
        if (rev > 0) {
            if (vatCharged === 0) {
                checks.push(chk(4, "НАЛОГИ", "warn", `НДС 3130 = 0 при выручке ${fmtN(rev)} тг (весь экспорт/освобождение?)`));
            }
            else {
                const pct = (vatCharged / rev * 100).toFixed(1);
                checks.push(chk(4, "НАЛОГИ", "ok", `НДС 3130: ${fmtN(vatCharged)} тг (${pct}% от выручки ${fmtN(rev)} тг)`));
            }
        }
        else {
            checks.push(chk(4, "НАЛОГИ", "ok", "НДС: выручки за период нет — начисление не требуется"));
        }
        // 4.2 Зарплатные налоги
        const b3350val = b3350?.creditBalance ?? 0;
        const b3210val = b3210?.creditBalance ?? 0;
        if (b3350val > 0 || b3210val > 0) {
            checks.push(chk(4, "НАЛОГИ", "ok", `Зарплатные налоги: 3350=${fmtN(b3350val)} тг, 3210=${fmtN(b3210val)} тг`));
        }
        else if (salaryDocs.length > 0) {
            checks.push(chk(4, "НАЛОГИ", "warn", "Зарплата начислена, но остатки 3350/3210 = 0 (уже выплачено — OK?)"));
        }
        else {
            checks.push(chk(4, "НАЛОГИ", "warn", "Зарплатные налоги не обнаружены (нет НачислениеЗарплаты)"));
        }
        // 4.3 КПН — только декабрь
        if (month === 12) {
            const b3110 = await register.getAccountBalance("3110", organizationGuid, lastDay).catch(() => null);
            if ((b3110?.creditBalance ?? 0) === 0) {
                checks.push(chk(4, "НАЛОГИ", "error", "КПН 3110: декабрь — остаток = 0, КПН не начислен?"));
            }
            else {
                checks.push(chk(4, "НАЛОГИ", "ok", `КПН 3110: ${fmtN(b3110.creditBalance)} тг — начислен`));
            }
        }
        // ── БЛОК 5: ДИНАМИКА (сравнение с предыдущим периодом) ──────────────────────
        const prevYear = month === 1 ? year - 1 : year;
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevFrom = `${prevYear}-${pad(prevMonth)}-01`;
        const prevTo = new Date(prevYear, prevMonth, 0).toISOString().split("T")[0];
        const [prev6010, prevManualCount] = await Promise.all([
            register.getAccountTurnovers("6010", prevFrom, prevTo, organizationGuid).catch(() => null),
            this.client.getCollection("Document_ОперацияБух", {
                filter: `Организация_Key eq guid'${organizationGuid}' and DeletionMark eq false and Date ge datetime'${prevFrom}T00:00:00' and Date le datetime'${prevTo}T23:59:59'`,
                select: "Ref_Key", top: 500,
            }).then(r => r.length).catch(() => 0),
        ]);
        // 5.1 Выручка 6010 vs прошлый период
        const currRev = t6010?.creditTurnover ?? 0;
        const prevRev = prev6010?.creditTurnover ?? 0;
        if (prevRev > 0) {
            const chg = (currRev - prevRev) / prevRev;
            const sign = chg >= 0 ? "+" : "";
            if (Math.abs(chg) > 0.5) {
                checks.push(chk(5, "ДИНАМИКА", "warn", `Выручка: ${fmtN(currRev)} тг vs ${fmtN(prevRev)} тг пред. период (${sign}${(chg * 100).toFixed(0)}%) — резкое изменение`, chg));
            }
            else {
                checks.push(chk(5, "ДИНАМИКА", "ok", `Выручка: ${fmtN(currRev)} тг (${sign}${(chg * 100).toFixed(0)}% к пред. периоду)`));
            }
        }
        else {
            checks.push(chk(5, "ДИНАМИКА", "ok", `Выручка: ${fmtN(currRev)} тг (нет данных прошлого периода)`));
        }
        // 5.2 Рост ручных проводок vs прошлый период
        const currManual = manualEntries.length;
        if (currManual > 0 && prevManualCount === 0) {
            checks.push(chk(5, "ДИНАМИКА", "warn", `ОперацияБух: ${currManual} шт. в текущем vs 0 в прошлом периоде`));
        }
        else if (prevManualCount > 0 && currManual > prevManualCount * 2) {
            checks.push(chk(5, "ДИНАМИКА", "warn", `ОперацияБух: ${currManual} vs ${prevManualCount} в прошлом — рост в ${Math.round(currManual / prevManualCount)}x`, currManual));
        }
        // Summary
        const summary = {
            ok: checks.filter(c => c.status === "ok").length,
            warn: checks.filter(c => c.status === "warn").length,
            error: checks.filter(c => c.status === "error").length,
        };
        return { organizationName, year, month, periodLabel, checks, summary };
    }
    async getMonthCloseStatus(organizationGuid, year, month) {
        const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
        const monthEnd = new Date(year, month, 0).toISOString().split("T")[0];
        const rows = await this.client.getCollection("Document_ЗакрытиеМесяца", {
            filter: `Организация_Key eq guid'${organizationGuid}' and Date ge datetime'${monthStart}T00:00:00' and Date le datetime'${monthEnd}T23:59:59'`,
            select: "Ref_Key,Date,Posted",
            top: 1,
        }).catch(() => []);
        if (rows.length === 0)
            return { found: false, posted: false, date: null, guid: null };
        return { found: true, posted: rows[0].Posted, date: rows[0].Date, guid: rows[0].Ref_Key };
    }
}
//# sourceMappingURL=AuditorService.js.map