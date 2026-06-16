const r2 = (n) => Math.round(n * 100) / 100;
export class ReportsService {
    client;
    constructor(client) {
        this.client = client;
    }
    async getOSV(dateFrom, dateTo, organizationGuid) {
        const accounts = await this.client.getCollection("ChartOfAccounts_Типовой", { select: "Ref_Key,Code,Description", top: 1000 });
        const accountMap = new Map(accounts.map(a => [a.Ref_Key, { code: a.Code ?? "", name: a.Description ?? "" }]));
        const filters = [];
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const rows = await this.client.getBalanceAndTurnovers("AccountingRegister_Типовой", {
            filter: filters.length ? filters.join(" and ") : undefined,
            select: "Account_Key,СуммаOpeningBalanceDr,СуммаOpeningBalanceCr,СуммаTurnoverDr,СуммаTurnoverCr,СуммаClosingBalanceDr,СуммаClosingBalanceCr",
            top: 5000,
            StartPeriod: `${dateFrom}T00:00:00`,
            EndPeriod: `${dateTo}T23:59:59`,
        });
        const grouped = new Map();
        for (const row of rows) {
            const key = row.Account_Key ?? "";
            const g = grouped.get(key) ?? { openDr: 0, openCr: 0, turnDr: 0, turnCr: 0, closeDr: 0, closeCr: 0 };
            g.openDr += row.СуммаOpeningBalanceDr ?? 0;
            g.openCr += row.СуммаOpeningBalanceCr ?? 0;
            g.turnDr += row.СуммаTurnoverDr ?? 0;
            g.turnCr += row.СуммаTurnoverCr ?? 0;
            g.closeDr += row.СуммаClosingBalanceDr ?? 0;
            g.closeCr += row.СуммаClosingBalanceCr ?? 0;
            grouped.set(key, g);
        }
        const result = [];
        const totals = { openDr: 0, openCr: 0, turnDr: 0, turnCr: 0, closeDr: 0, closeCr: 0 };
        for (const [accountGuid, v] of grouped) {
            if (v.openDr === 0 && v.openCr === 0 && v.turnDr === 0 && v.turnCr === 0 && v.closeDr === 0 && v.closeCr === 0)
                continue;
            const account = accountMap.get(accountGuid);
            result.push({
                accountCode: account?.code ?? accountGuid,
                accountName: account?.name ?? "",
                openingDr: r2(v.openDr),
                openingCr: r2(v.openCr),
                turnoverDr: r2(v.turnDr),
                turnoverCr: r2(v.turnCr),
                closingDr: r2(v.closeDr),
                closingCr: r2(v.closeCr),
            });
            totals.openDr += v.openDr;
            totals.openCr += v.openCr;
            totals.turnDr += v.turnDr;
            totals.turnCr += v.turnCr;
            totals.closeDr += v.closeDr;
            totals.closeCr += v.closeCr;
        }
        result.sort((a, b) => a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true }));
        return {
            rows: result,
            totals: {
                openDr: r2(totals.openDr), openCr: r2(totals.openCr),
                turnDr: r2(totals.turnDr), turnCr: r2(totals.turnCr),
                closeDr: r2(totals.closeDr), closeCr: r2(totals.closeCr),
            },
        };
    }
    async resolveNames(guids) {
        const nameMap = new Map();
        const unique = [...new Set(guids.filter(Boolean))];
        const BATCH = 10;
        for (let i = 0; i < unique.length; i += BATCH) {
            const batch = unique.slice(i, i + BATCH);
            const filter = batch.map(g => `Ref_Key eq guid'${g}'`).join(" or ");
            const [contractors, employees] = await Promise.all([
                this.client.getCollection("Catalog_Контрагенты", { filter, select: "Ref_Key,Description", top: BATCH }).catch(() => []),
                this.client.getCollection("Catalog_ФизическиеЛица", { filter, select: "Ref_Key,Description", top: BATCH }).catch(() => []),
            ]);
            for (const c of [...contractors, ...employees])
                nameMap.set(c.Ref_Key, c.Description);
        }
        return nameMap;
    }
    async getSettlementRows(accountCodes, organizationGuid, date) {
        const accountRows = await this.client.getCollection("ChartOfAccounts_Типовой", {
            filter: accountCodes.map(c => `Code eq '${c}'`).join(" or "),
            select: "Ref_Key,Code",
            top: 20,
        });
        if (!accountRows.length)
            return { rows: [], byAccount: {} };
        const allRows = [];
        const byAccount = {};
        for (const acc of accountRows) {
            const filters = [`Account_Key eq guid'${acc.Ref_Key}'`];
            if (organizationGuid)
                filters.push(`Организация_Key eq guid'${organizationGuid}'`);
            const balRows = await this.client.getRegisterBalance("AccountingRegister_Типовой", {
                filter: filters.join(" and "),
                select: "Account_Key,ExtDimension1,ExtDimension1_Type,СуммаBalanceDr,СуммаBalanceCr",
                top: 2000,
                ...(date ? { Period: `${date}T23:59:59` } : {}),
            });
            let accNet = 0;
            for (const row of balRows) {
                const dr = row.СуммаBalanceDr ?? 0;
                const cr = row.СуммаBalanceCr ?? 0;
                if (dr === 0 && cr === 0)
                    continue;
                allRows.push({ accountCode: acc.Code, contractorGuid: row.ExtDimension1 ?? "", contractorName: "", balanceDr: dr, balanceCr: cr });
                accNet += dr - cr;
            }
            byAccount[acc.Code] = r2(accNet);
        }
        const nameMap = await this.resolveNames(allRows.map(r => r.contractorGuid));
        for (const row of allRows)
            row.contractorName = nameMap.get(row.contractorGuid) ?? row.contractorGuid.slice(0, 8);
        return { rows: allRows, byAccount };
    }
    async getAllDebtors(organizationGuid, date) {
        const { rows, byAccount } = await this.getSettlementRows(["1210", "1250", "1251", "1254", "1255"], organizationGuid, date);
        const filtered = rows.filter(r => r.balanceDr >= r.balanceCr);
        return { rows: filtered, total: r2(filtered.reduce((s, r) => s + r.balanceDr - r.balanceCr, 0)), byAccount };
    }
    async getAllCreditors(organizationGuid, date) {
        const { rows, byAccount } = await this.getSettlementRows(["3310", "3350", "3387", "3390"], organizationGuid, date);
        const filtered = rows.filter(r => r.balanceCr >= r.balanceDr);
        return { rows: filtered, total: r2(filtered.reduce((s, r) => s + r.balanceCr - r.balanceDr, 0)), byAccount };
    }
    async getIncomingPayments(dateFrom, dateTo, contractorGuid, organizationGuid) {
        const filters = [
            "DeletionMark eq false",
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (contractorGuid)
            filters.push(`Контрагент_Key eq guid'${contractorGuid}'`);
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const docs = await this.client.getCollection("Document_ПлатежноеПоручениеВходящее", {
            filter: filters.join(" and "),
            select: "Ref_Key,Date,Number,СуммаДокумента,ВалютаДокумента_Key,Контрагент_Key,НазначениеПлатежа,Posted",
            orderby: "Date asc",
            top: 2000,
        });
        const contractorGuids = [...new Set(docs.map(d => d.Контрагент_Key).filter(Boolean))];
        const currencyGuids = [...new Set(docs.map(d => d.ВалютаДокумента_Key).filter(Boolean))];
        const [contractorNames, currencyNames] = await Promise.all([
            this.resolveNames(contractorGuids),
            (async () => {
                const map = new Map();
                if (!currencyGuids.length)
                    return map;
                const BATCH = 10;
                for (let i = 0; i < currencyGuids.length; i += BATCH) {
                    const batch = currencyGuids.slice(i, i + BATCH);
                    const rows = await this.client.getCollection("Catalog_Валюты", { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH }).catch(() => []);
                    for (const r of rows)
                        map.set(r.Ref_Key, r.Description);
                }
                return map;
            })(),
        ]);
        const rows = docs.map(d => ({
            date: d.Date?.slice(0, 10) ?? "",
            number: d.Number ?? "",
            contractor: contractorNames.get(d.Контрагент_Key ?? "") ?? "",
            currency: currencyNames.get(d.ВалютаДокумента_Key ?? "") ?? "",
            amount: d.СуммаДокумента ?? 0,
            purpose: d.НазначениеПлатежа ?? "",
            posted: d.Posted ?? false,
            docGuid: d.Ref_Key,
        }));
        const totalByCurrency = {};
        for (const r of rows) {
            totalByCurrency[r.currency] = r2((totalByCurrency[r.currency] ?? 0) + r.amount);
        }
        return { rows, totalByCurrency };
    }
    async getOutgoingPayments(dateFrom, dateTo, contractorGuid, organizationGuid) {
        const filters = [
            "DeletionMark eq false",
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (contractorGuid)
            filters.push(`Контрагент_Key eq guid'${contractorGuid}'`);
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const docs = await this.client.getCollection("Document_ПлатежноеПоручениеИсходящее", {
            filter: filters.join(" and "),
            select: "Ref_Key,Date,Number,СуммаДокумента,ВалютаДокумента_Key,Контрагент_Key,НазначениеПлатежа,Posted",
            orderby: "Date asc",
            top: 2000,
        });
        const contractorGuids = [...new Set(docs.map(d => d.Контрагент_Key).filter(Boolean))];
        const currencyGuids = [...new Set(docs.map(d => d.ВалютаДокумента_Key).filter(Boolean))];
        const [contractorNames, currencyNames] = await Promise.all([
            this.resolveNames(contractorGuids),
            (async () => {
                const map = new Map();
                if (!currencyGuids.length)
                    return map;
                const BATCH = 10;
                for (let i = 0; i < currencyGuids.length; i += BATCH) {
                    const batch = currencyGuids.slice(i, i + BATCH);
                    const rows = await this.client.getCollection("Catalog_Валюты", { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH }).catch(() => []);
                    for (const r of rows)
                        map.set(r.Ref_Key, r.Description);
                }
                return map;
            })(),
        ]);
        const rows = docs.map(d => ({
            date: d.Date?.slice(0, 10) ?? "",
            number: d.Number ?? "",
            contractor: contractorNames.get(d.Контрагент_Key ?? "") ?? "",
            currency: currencyNames.get(d.ВалютаДокумента_Key ?? "") ?? "",
            amount: d.СуммаДокумента ?? 0,
            purpose: d.НазначениеПлатежа ?? "",
            posted: d.Posted ?? false,
            docGuid: d.Ref_Key,
        }));
        const totalByCurrency = {};
        for (const r of rows) {
            totalByCurrency[r.currency] = r2((totalByCurrency[r.currency] ?? 0) + r.amount);
        }
        return { rows, totalByCurrency };
    }
    async getPurchasesReport(dateFrom, dateTo, contractorGuid, organizationGuid) {
        const filters = [
            "Posted eq true", "DeletionMark eq false",
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (contractorGuid)
            filters.push(`Контрагент_Key eq guid'${contractorGuid}'`);
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const docs = await this.client.getCollection("Document_ПоступлениеТоваровУслуг", {
            filter: filters.join(" and "),
            select: "Ref_Key,Date,Number,Контрагент_Key,ДоговорКонтрагента_Key,ВалютаДокумента_Key,Организация_Key",
            orderby: "Date asc",
            top: 2000,
        });
        if (!docs.length)
            return { rows: [], totals: { amount: 0, vatAmount: 0, total: 0 } };
        const docGuids = docs.map(d => d.Ref_Key);
        const docMap = new Map(docs.map(d => [d.Ref_Key, d]));
        // Fetch tabular parts
        const fetchRows = async (suffix) => {
            const BATCH = 20;
            const all = [];
            for (let i = 0; i < docGuids.length; i += BATCH) {
                const batch = docGuids.slice(i, i + BATCH);
                const r = await this.client.getCollection(`Document_ПоступлениеТоваровУслуг_${suffix}`, {
                    filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "),
                    select: "Ref_Key,Номенклатура_Key,Количество,ЕдиницаИзмерения_Key,Цена,Сумма,СуммаНДС",
                    top: BATCH * 50,
                }).catch(() => []);
                all.push(...r);
            }
            return all;
        };
        const [tovRows, svcRows] = await Promise.all([fetchRows("Товары"), fetchRows("Услуги")]);
        const allLineRows = [...tovRows, ...svcRows];
        // Batch load references
        const contrGuids = [...new Set(docs.map(d => d.Контрагент_Key).filter(Boolean))];
        const contractGuids = [...new Set(docs.map(d => d.ДоговорКонтрагента_Key).filter(Boolean))];
        const currGuids = [...new Set(docs.map(d => d.ВалютаДокумента_Key).filter(Boolean))];
        const nomGuids = [...new Set(allLineRows.map(r => r.Номенклатура_Key).filter(Boolean))];
        const loadNames = async (guids, entity) => {
            const map = new Map();
            const BATCH = 10;
            for (let i = 0; i < guids.length; i += BATCH) {
                const batch = guids.slice(i, i + BATCH);
                const rows = await this.client.getCollection(entity, { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH }).catch(() => []);
                for (const r of rows)
                    map.set(r.Ref_Key, r.Description);
            }
            return map;
        };
        const [contrNames, contractNames, currNames, nomNames] = await Promise.all([
            this.resolveNames(contrGuids),
            loadNames(contractGuids, "Catalog_ДоговорыКонтрагентов").catch(() => loadNames(contractGuids, "Catalog_ДоговорыКонтрагентов")),
            loadNames(currGuids, "Catalog_Валюты"),
            loadNames(nomGuids, "Catalog_Номенклатура"),
        ]);
        const rows = [];
        const addRows = (lineRows, lineType) => {
            for (const row of lineRows) {
                const doc = docMap.get(row.Ref_Key);
                if (!doc)
                    continue;
                const amount = row.Сумма ?? 0;
                const vatAmount = row.СуммаНДС ?? 0;
                const pct = vatAmount === 0 ? "0%" : amount <= 0 ? "НДС" : `${Math.round((vatAmount / amount) * 100)}%`;
                rows.push({
                    date: doc.Date?.slice(0, 10) ?? "",
                    docNumber: doc.Number ?? "",
                    contractor: contrNames.get(doc.Контрагент_Key ?? "") ?? "",
                    contract: contractNames.get(doc.ДоговорКонтрагента_Key ?? "") ?? "",
                    currency: currNames.get(doc.ВалютаДокумента_Key ?? "") ?? "",
                    lineType,
                    item: nomNames.get(row.Номенклатура_Key ?? "") ?? "",
                    qty: row.Количество ?? 0,
                    uom: "",
                    price: row.Цена ?? 0,
                    amount,
                    vatPct: pct,
                    vatAmount,
                    total: amount + vatAmount,
                    docGuid: row.Ref_Key,
                });
            }
        };
        addRows(tovRows, "Товар");
        addRows(svcRows, "Услуга");
        rows.sort((a, b) => a.date.localeCompare(b.date));
        const totals = {
            amount: r2(rows.reduce((s, r) => s + r.amount, 0)),
            vatAmount: r2(rows.reduce((s, r) => s + r.vatAmount, 0)),
            total: r2(rows.reduce((s, r) => s + r.total, 0)),
        };
        return { rows: rows, totals };
    }
    async getContractorBalance(contractorGuid, date) {
        const [contrRows, accounts, balRows] = await Promise.all([
            this.client.getCollection("Catalog_Контрагенты", { filter: `Ref_Key eq guid'${contractorGuid}'`, select: "Ref_Key,Description", top: 1 }).catch(() => []),
            this.client.getCollection("ChartOfAccounts_Типовой", { select: "Ref_Key,Code,Description", top: 1000 }),
            this.client.getRegisterBalance("AccountingRegister_Типовой", {
                select: "Account_Key,ExtDimension1,ExtDimension2,СуммаBalanceDr,СуммаBalanceCr",
                top: 5000,
                ...(date ? { Period: `${date}T23:59:59` } : {}),
            }),
        ]);
        const contractorName = contrRows[0]?.Description ?? contractorGuid;
        const accMap = new Map(accounts.map(a => [a.Ref_Key, { code: a.Code ?? "", name: a.Description ?? "" }]));
        const contrBalRows = balRows.filter(r => r.ExtDimension1 === contractorGuid || r.ExtDimension2 === contractorGuid);
        const byAcc = new Map();
        for (const r of contrBalRows) {
            const key = r.Account_Key ?? "";
            const g = byAcc.get(key) ?? { dr: 0, cr: 0 };
            g.dr += r.СуммаBalanceDr ?? 0;
            g.cr += r.СуммаBalanceCr ?? 0;
            byAcc.set(key, g);
        }
        const rows = [...byAcc.entries()]
            .map(([guid, v]) => {
            const acc = accMap.get(guid) ?? { code: "?", name: "?" };
            return { accountCode: acc.code, accountName: acc.name, balanceDr: r2(v.dr), balanceCr: r2(v.cr), net: r2(v.dr - v.cr) };
        })
            .filter(r => r.balanceDr !== 0 || r.balanceCr !== 0)
            .sort((a, b) => a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true }));
        const totals = {
            balanceDr: r2(rows.reduce((s, r) => s + r.balanceDr, 0)),
            balanceCr: r2(rows.reduce((s, r) => s + r.balanceCr, 0)),
            net: r2(rows.reduce((s, r) => s + r.net, 0)),
        };
        return { contractorName, rows, totals };
    }
    async detectAnomalies(dateFrom, dateTo, organizationGuid) {
        const baseFilters = [
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (organizationGuid)
            baseFilters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const filterStr = baseFilters.join(" and ");
        // 1. Manual ОперацияБух entries
        const manualRaw = await this.client.getCollection("Document_ОперацияБух", {
            filter: filterStr,
            select: "Ref_Key,Date,Number,СуммаДокумента,Комментарий",
            orderby: "Date desc",
            top: 500,
        }).catch(() => []);
        const manualEntries = manualRaw.map(r => ({
            guid: r.Ref_Key,
            date: r.Date?.slice(0, 10) ?? "",
            number: r.Number ?? "",
            amount: r.СуммаДокумента ?? 0,
            comment: r.Комментарий ?? "",
        }));
        // 2. Round amounts ≥ 1M divisible by 1M
        const roundAmounts = [];
        for (const dt of ["РеализацияТоваровУслуг", "ПоступлениеТоваровУслуг", "ОперацияБух"]) {
            const docs = await this.client.getCollection(`Document_${dt}`, {
                filter: filterStr,
                select: "Ref_Key,Date,Number,СуммаДокумента",
                top: 1000,
            }).catch(() => []);
            for (const d of docs) {
                const amt = d.СуммаДокумента ?? 0;
                if (amt >= 1_000_000 && amt % 1_000_000 === 0) {
                    roundAmounts.push({ guid: d.Ref_Key, date: d.Date?.slice(0, 10) ?? "", number: d.Number ?? "", amount: amt, docType: dt });
                }
            }
        }
        // 3. Unposted documents
        const unpostedFilters = [
            "Posted eq false", "DeletionMark eq false",
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (organizationGuid)
            unpostedFilters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const unpostedFilter = unpostedFilters.join(" and ");
        const unposted = [];
        for (const dt of ["РеализацияТоваровУслуг", "ПоступлениеТоваровУслуг", "ПлатежноеПоручениеИсходящее", "ПлатежноеПоручениеВходящее"]) {
            const docs = await this.client.getCollection(`Document_${dt}`, {
                filter: unpostedFilter, select: "Ref_Key", top: 500,
            }).catch(() => []);
            if (docs.length > 0)
                unposted.push({ docType: dt, count: docs.length });
        }
        return {
            manualEntries,
            roundAmounts,
            unposted,
            summary: { manual: manualEntries.length, round: roundAmounts.length, unposted: unposted.reduce((s, u) => s + u.count, 0) },
        };
    }
    async getDetailedCreditors(organizationGuid, date) {
        const asOf = date ?? new Date().toISOString().slice(0, 10);
        const { rows: baseRows, byAccount } = await this.getSettlementRows(["3310", "3350", "3387", "3390"], organizationGuid, date);
        const creditorRows = baseRows.filter(r => r.balanceCr > r.balanceDr);
        if (!creditorRows.length)
            return { rows: [], total: 0, byAccount, asOfDate: asOf };
        const BATCH = 8;
        const result = [];
        for (let i = 0; i < creditorRows.length; i += BATCH) {
            const batch = creditorRows.slice(i, i + BATCH);
            await Promise.all(batch.map(async (cr) => {
                const balance = r2(cr.balanceCr - cr.balanceDr);
                const obligationType = cr.accountCode === "3350" ? "payroll"
                    : cr.accountCode === "3387" ? "advance_received"
                        : "supplier_debt";
                let firstDocDate = null;
                let firstDocNumber = null;
                let lastDocDate = null;
                const contractSet = new Set();
                let totalPaid = 0;
                let lastPaymentDate = null;
                let lastPaymentPurpose = null;
                if (cr.contractorGuid && obligationType !== "payroll") {
                    const docFilter = [
                        "Posted eq true", "DeletionMark eq false",
                        `Контрагент_Key eq guid'${cr.contractorGuid}'`,
                        ...(organizationGuid ? [`Организация_Key eq guid'${organizationGuid}'`] : []),
                    ].join(" and ");
                    const [docs, payments] = await Promise.all([
                        this.client.getCollection("Document_ПоступлениеТоваровУслуг", {
                            filter: docFilter,
                            select: "Date,Number,ДоговорКонтрагента_Key",
                            orderby: "Date asc",
                            top: 100,
                        }).catch(() => []),
                        this.client.getCollection("Document_ПлатежноеПоручениеИсходящее", {
                            filter: [
                                "Posted eq true", "DeletionMark eq false",
                                `Контрагент_Key eq guid'${cr.contractorGuid}'`,
                                `Date ge datetime'2024-01-01T00:00:00'`,
                                ...(organizationGuid ? [`Организация_Key eq guid'${organizationGuid}'`] : []),
                            ].join(" and "),
                            select: "Date,СуммаДокумента,НазначениеПлатежа",
                            orderby: "Date desc",
                            top: 200,
                        }).catch(() => []),
                    ]);
                    if (docs.length) {
                        firstDocDate = docs[0].Date.slice(0, 10);
                        firstDocNumber = docs[0].Number;
                        lastDocDate = docs[docs.length - 1].Date.slice(0, 10);
                        for (const d of docs) {
                            if (d.ДоговорКонтрагента_Key)
                                contractSet.add(d.ДоговорКонтрагента_Key);
                        }
                    }
                    if (payments.length) {
                        totalPaid = r2(payments.reduce((s, p) => s + (p.СуммаДокумента ?? 0), 0));
                        lastPaymentDate = payments[0].Date.slice(0, 10);
                        lastPaymentPurpose = payments[0].НазначениеПлатежа ?? null;
                    }
                }
                // Resolve contract names
                const contracts = [];
                const contractGuids = [...contractSet];
                if (contractGuids.length) {
                    const contractDocs = await this.client.getCollection("Catalog_ДоговорыКонтрагентов", {
                        filter: contractGuids.slice(0, 5).map(g => `Ref_Key eq guid'${g}'`).join(" or "),
                        select: "Ref_Key,Description",
                        top: 5,
                    }).catch(() => []);
                    for (const c of contractDocs)
                        contracts.push(c.Description ?? c.Ref_Key.slice(0, 8));
                }
                // Age category based on first doc date
                let ageCategory = "unknown";
                if (firstDocDate) {
                    const ageMs = new Date(asOf).getTime() - new Date(firstDocDate).getTime();
                    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365);
                    if (ageYears < 1)
                        ageCategory = "current";
                    else if (ageYears < 2)
                        ageCategory = "1y";
                    else if (ageYears < 3)
                        ageCategory = "2y";
                    else
                        ageCategory = "3y+";
                }
                else if (lastDocDate) {
                    const ageMs = new Date(asOf).getTime() - new Date(lastDocDate).getTime();
                    ageCategory = ageMs / (1000 * 60 * 60 * 24 * 365) < 1 ? "current" : "3y+";
                }
                result.push({
                    accountCode: cr.accountCode,
                    contractorGuid: cr.contractorGuid,
                    contractorName: cr.contractorName,
                    balance,
                    currency: "KZT",
                    firstDocDate,
                    firstDocNumber,
                    lastDocDate,
                    contracts,
                    totalPaid2024to2026: totalPaid,
                    lastPaymentDate,
                    lastPaymentPurpose,
                    ageCategory,
                    obligationType,
                });
            }));
        }
        result.sort((a, b) => b.balance - a.balance);
        return {
            rows: result,
            total: r2(result.reduce((s, r) => s + r.balance, 0)),
            byAccount,
            asOfDate: asOf,
        };
    }
    // ── Detailed advances received (3510) ────────────────────────────────────
    async getDetailedAdvancesReceived(organizationGuid, date) {
        const asOf = date ?? new Date().toISOString().slice(0, 10);
        const { rows: baseRows, byAccount } = await this.getSettlementRows(["3510"], organizationGuid, date);
        const advanceRows = baseRows.filter(r => r.balanceCr > r.balanceDr);
        if (!advanceRows.length)
            return { rows: [], total: 0, byAccount, asOfDate: asOf };
        const BATCH = 8;
        const result = [];
        for (let i = 0; i < advanceRows.length; i += BATCH) {
            const batch = advanceRows.slice(i, i + BATCH);
            await Promise.all(batch.map(async (cr) => {
                const balance = r2(cr.balanceCr - cr.balanceDr);
                let firstDocDate = null;
                let firstDocNumber = null;
                let lastDocDate = null;
                const contractSet = new Set();
                let totalPaid = 0;
                let lastPaymentDate = null;
                let lastPaymentPurpose = null;
                if (cr.contractorGuid) {
                    const baseFilter = [
                        "Posted eq true", "DeletionMark eq false",
                        `Контрагент_Key eq guid'${cr.contractorGuid}'`,
                        ...(organizationGuid ? [`Организация_Key eq guid'${organizationGuid}'`] : []),
                    ].join(" and ");
                    // Incoming payments = when we received the advance
                    const [inDocs, salesDocs] = await Promise.all([
                        this.client.getCollection("Document_ПлатежноеПоручениеВходящее", {
                            filter: baseFilter,
                            select: "Date,Number,ДоговорКонтрагента_Key,СуммаДокумента",
                            orderby: "Date asc",
                            top: 500,
                        }).catch(() => []),
                        // Sales = how much we have fulfilled
                        this.client.getCollection("Document_РеализацияТоваровУслуг", {
                            filter: [
                                baseFilter,
                                `Date ge datetime'2020-01-01T00:00:00'`,
                            ].join(" and "),
                            select: "Date,Number,ДоговорКонтрагента_Key,СуммаДокумента",
                            orderby: "Date asc",
                            top: 500,
                        }).catch(() => []),
                    ]);
                    if (inDocs.length) {
                        firstDocDate = inDocs[0].Date.slice(0, 10);
                        firstDocNumber = inDocs[0].Number;
                        lastDocDate = inDocs[inDocs.length - 1].Date.slice(0, 10);
                        for (const d of inDocs) {
                            if (d.ДоговорКонтрагента_Key)
                                contractSet.add(d.ДоговорКонтрагента_Key);
                        }
                    }
                    if (salesDocs.length) {
                        totalPaid = r2(salesDocs.reduce((s, d) => s + (d.СуммаДокумента ?? 0), 0));
                        lastPaymentDate = salesDocs[salesDocs.length - 1].Date.slice(0, 10);
                        lastPaymentPurpose = `Отгружено по ${salesDocs.length} накладным`;
                    }
                }
                // Resolve contract names
                const contracts = [];
                const contractGuids = [...contractSet];
                if (contractGuids.length) {
                    const contractDocs = await this.client.getCollection("Catalog_ДоговорыКонтрагентов", {
                        filter: contractGuids.slice(0, 5).map(g => `Ref_Key eq guid'${g}'`).join(" or "),
                        select: "Ref_Key,Description",
                        top: 5,
                    }).catch(() => []);
                    for (const c of contractDocs)
                        contracts.push(c.Description ?? c.Ref_Key.slice(0, 8));
                }
                let ageCategory = "unknown";
                if (firstDocDate) {
                    const ageMs = new Date(asOf).getTime() - new Date(firstDocDate).getTime();
                    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365);
                    if (ageYears < 1)
                        ageCategory = "current";
                    else if (ageYears < 2)
                        ageCategory = "1y";
                    else if (ageYears < 3)
                        ageCategory = "2y";
                    else
                        ageCategory = "3y+";
                }
                result.push({
                    accountCode: "3510",
                    contractorGuid: cr.contractorGuid,
                    contractorName: cr.contractorName,
                    balance,
                    currency: "KZT",
                    firstDocDate,
                    firstDocNumber,
                    lastDocDate,
                    contracts,
                    totalPaid2024to2026: totalPaid,
                    lastPaymentDate,
                    lastPaymentPurpose,
                    ageCategory,
                    obligationType: "advance_received",
                });
            }));
        }
        result.sort((a, b) => b.balance - a.balance);
        return {
            rows: result,
            total: r2(result.reduce((s, r) => s + r.balance, 0)),
            byAccount,
            asOfDate: asOf,
        };
    }
    // ── Full liabilities report (all accounts) ───────────────────────────────
    async getFullLiabilitiesReport(organizationGuid, date) {
        const asOf = date ?? new Date().toISOString().slice(0, 10);
        const year = asOf.slice(0, 4);
        // Run all sections in parallel
        const [supplierResult, advancesResult, osvRows] = await Promise.all([
            this.getDetailedCreditors(organizationGuid, date),
            this.getDetailedAdvancesReceived(organizationGuid, date),
            this.getOSV(`${year}-01-01`, asOf, organizationGuid),
        ]);
        // Extract closing Cr balances from OSV for all liability/equity accounts
        const liabilityAccounts = osvRows.rows.filter(r => (r.closingCr > 0) &&
            !["5030", "5570", "5610", "5620", "5710", "6010", "6110", "6250", "6290"].includes(r.accountCode));
        // Tax accounts from OSV
        const TAX_ACCOUNTS = ["3110", "3120", "3131", "3150", "3170", "3211", "3212", "3213", "3220", "3250", "4310"];
        const taxLiabilities = liabilityAccounts
            .filter(r => TAX_ACCOUNTS.includes(r.accountCode))
            .map(r => ({ accountCode: r.accountCode, accountName: r.accountName, balance: r.closingCr }));
        // Other non-contractor accounts
        const OTHER_ACCOUNTS = ["3386", "3430", "3360", "3382", "4110", "2420", "1280"];
        const otherLiabilities = liabilityAccounts
            .filter(r => OTHER_ACCOUNTS.includes(r.accountCode))
            .map(r => ({
            accountCode: r.accountCode,
            accountName: r.accountName,
            balance: r.closingCr,
            note: r.accountCode === "3386" ? "Подотчётные лица — к возмещению"
                : r.accountCode === "3430" ? "Резерв отпускных и бонусов"
                    : r.accountCode === "4110" ? "Долгосрочная КЗ поставщикам"
                        : r.accountCode === "2420" ? "Амортизация ОС (контра-актив)"
                            : r.accountCode === "1280" ? "Резерв обесценения ДЗ (контра-актив)"
                                : "",
        }));
        const taxTotal = r2(taxLiabilities.reduce((s, r) => s + r.balance, 0));
        const otherTotal = r2(otherLiabilities
            .filter(r => !["2420", "1280"].includes(r.accountCode))
            .reduce((s, r) => s + r.balance, 0));
        const grandTotal = r2(supplierResult.total +
            advancesResult.total +
            taxTotal +
            otherTotal);
        return {
            asOfDate: asOf,
            grandTotal,
            sections: [
                {
                    sectionName: "Полученные авансы (3510) — обязательства по поставке",
                    accountCodes: ["3510"],
                    total: advancesResult.total,
                    rows: advancesResult.rows,
                },
                {
                    sectionName: "Кредиторы поставщики и прочая КЗ (3310/3350/3387/3390)",
                    accountCodes: ["3310", "3350", "3387", "3390"],
                    total: supplierResult.total,
                    rows: supplierResult.rows,
                },
            ],
            taxLiabilities,
            otherLiabilities,
            osvSnapshot: liabilityAccounts.map(r => ({
                accountCode: r.accountCode,
                accountName: r.accountName,
                closingCr: r.closingCr,
            })),
        };
    }
    // ── Advance settlement status (account 3510 / 3387) ───────────────────────
    // Shows how much an advance-paying contractor has been fulfilled vs. outstanding.
    async getAdvanceSettlementStatus(contractorGuid, organizationGuid, dateFrom = "2000-01-01", dateTo = new Date().toISOString().slice(0, 10)) {
        const ADVANCE_ACCOUNTS = ["3510", "3387"];
        // Resolve account GUIDs and names
        const accountRows = await this.client.getCollection("ChartOfAccounts_Типовой", {
            filter: ADVANCE_ACCOUNTS.map(c => `Code eq '${c}'`).join(" or "),
            select: "Ref_Key,Code,Description",
            top: 10,
        });
        const accMap = new Map(accountRows.map(a => [a.Ref_Key, { code: a.Code ?? "", name: a.Description ?? "" }]));
        // Resolve contractor name
        const contrRows = await this.client.getCollection("Catalog_Контрагенты", { filter: `Ref_Key eq guid'${contractorGuid}'`, select: "Ref_Key,Description", top: 1 }).catch(() => []);
        const contractorName = contrRows[0]?.Description ?? contractorGuid;
        const accountResults = [];
        for (const acc of accountRows) {
            const filters = [`Account_Key eq guid'${acc.Ref_Key}'`];
            if (organizationGuid)
                filters.push(`Организация_Key eq guid'${organizationGuid}'`);
            const rows = await this.client.getBalanceAndTurnovers("AccountingRegister_Типовой", {
                filter: filters.join(" and "),
                select: "Account_Key,ExtDimension1,ExtDimension2,СуммаOpeningBalanceDr,СуммаOpeningBalanceCr,СуммаTurnoverDr,СуммаTurnoverCr,СуммаClosingBalanceDr,СуммаClosingBalanceCr",
                top: 5000,
                StartPeriod: `${dateFrom}T00:00:00`,
                EndPeriod: `${dateTo}T23:59:59`,
            }).catch(() => []);
            // Filter client-side for the contractor (ExtDimension filtering not supported server-side)
            const contrRows2 = rows.filter(r => r.ExtDimension1 === contractorGuid || r.ExtDimension2 === contractorGuid);
            const totalReceived = r2(contrRows2.reduce((s, r) => s + (r.СуммаTurnoverCr ?? 0), 0));
            const totalOffset = r2(contrRows2.reduce((s, r) => s + (r.СуммаTurnoverDr ?? 0), 0));
            const remainingBalance = r2(contrRows2.reduce((s, r) => s + ((r.СуммаClosingBalanceCr ?? 0) - (r.СуммаClosingBalanceDr ?? 0)), 0));
            const fulfillmentPct = totalReceived > 0
                ? Math.round((totalOffset / totalReceived) * 100)
                : 0;
            if (totalReceived > 0 || remainingBalance !== 0) {
                accountResults.push({
                    accountCode: acc.Code ?? "",
                    accountName: accMap.get(acc.Ref_Key)?.name ?? acc.Code ?? "",
                    totalReceived,
                    totalOffset,
                    remainingBalance,
                    fulfillmentPct,
                });
            }
        }
        const totalReceived = r2(accountResults.reduce((s, r) => s + r.totalReceived, 0));
        const totalOffset = r2(accountResults.reduce((s, r) => s + r.totalOffset, 0));
        const remaining = r2(accountResults.reduce((s, r) => s + r.remainingBalance, 0));
        return {
            contractorName,
            accounts: accountResults,
            summary: {
                totalReceived,
                totalOffset,
                remaining,
                fulfillmentPct: totalReceived > 0 ? Math.round((totalOffset / totalReceived) * 100) : 0,
            },
        };
    }
    // ── Sales with full line detail (nomenclature, qty, price) ────────────────
    // Accepts multiple contractor GUIDs — for querying an entire corporate group at once.
    async getSalesWithLines(contractorGuids, dateFrom, dateTo, organizationGuid) {
        if (!contractorGuids.length)
            return { rows: [], totals: { amount: 0, vatAmount: 0, docs: 0, lines: 0 }, byNomenclature: [] };
        const filters = [
            "Posted eq true",
            "DeletionMark eq false",
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
            `(${contractorGuids.map(g => `Контрагент_Key eq guid'${g}'`).join(" or ")})`,
        ];
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const docs = await this.client.getCollection("Document_РеализацияТоваровУслуг", {
            filter: filters.join(" and "),
            select: "Ref_Key,Date,Number,Контрагент_Key,СуммаДокумента",
            orderby: "Date asc",
            top: 2000,
        }).catch(() => []);
        if (!docs.length)
            return { rows: [], totals: { amount: 0, vatAmount: 0, docs: 0, lines: 0 }, byNomenclature: [] };
        const docGuids = docs.map(d => d.Ref_Key);
        const contrGuids = [...new Set(docs.map(d => d.Контрагент_Key).filter(Boolean))];
        // Fetch tabular parts in batches
        const BATCH = 20;
        const allLines = [];
        for (let i = 0; i < docGuids.length; i += BATCH) {
            const batch = docGuids.slice(i, i + BATCH);
            const [товары, услуги] = await Promise.all([
                this.client.getCollection("Document_РеализацияТоваровУслуг_Товары", {
                    filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "),
                    select: "Ref_Key,Номенклатура_Key,Количество,ЕдиницаИзмерения_Key,Цена,Сумма,СуммаНДС",
                    top: BATCH * 100,
                }).catch(() => []),
                this.client.getCollection("Document_РеализацияТоваровУслуг_Услуги", {
                    filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "),
                    select: "Ref_Key,Номенклатура_Key,Количество,ЕдиницаИзмерения_Key,Цена,Сумма,СуммаНДС",
                    top: BATCH * 100,
                }).catch(() => []),
            ]);
            allLines.push(...товары, ...услуги);
        }
        // Resolve names
        const nomGuids = [...new Set(allLines.map(l => l.Номенклатура_Key).filter(Boolean))];
        const uomGuids = [...new Set(allLines.map(l => l.ЕдиницаИзмерения_Key).filter(Boolean))];
        const loadNames = async (guids, entity) => {
            const map = new Map();
            for (let i = 0; i < guids.length; i += 10) {
                const rows = await this.client.getCollection(entity, { filter: guids.slice(i, i + 10).map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: 10 }).catch(() => []);
                for (const r of rows)
                    map.set(r.Ref_Key, r.Description);
            }
            return map;
        };
        const [contrNames, nomNames, uomNames] = await Promise.all([
            this.resolveNames(contrGuids),
            loadNames(nomGuids, "Catalog_Номенклатура"),
            loadNames(uomGuids, "Catalog_ЕдиницыИзмерения"),
        ]);
        const linesByDoc = new Map();
        for (const line of allLines) {
            if (!linesByDoc.has(line.Ref_Key))
                linesByDoc.set(line.Ref_Key, []);
            linesByDoc.get(line.Ref_Key).push(line);
        }
        const rows = docs.map(doc => ({
            date: doc.Date?.slice(0, 10) ?? "",
            docNumber: doc.Number ?? "",
            docGuid: doc.Ref_Key,
            contractorName: contrNames.get(doc.Контрагент_Key ?? "") ?? "",
            totalAmount: doc.СуммаДокумента ?? 0,
            lines: (linesByDoc.get(doc.Ref_Key) ?? []).map(l => ({
                item: nomNames.get(l.Номенклатура_Key ?? "") ?? "",
                qty: l.Количество ?? 0,
                unit: uomNames.get(l.ЕдиницаИзмерения_Key ?? "") ?? "",
                price: l.Цена ?? 0,
                amount: l.Сумма ?? 0,
                vatAmount: l.СуммаНДС ?? 0,
            })),
        }));
        // Aggregate by nomenclature
        const nomAgg = new Map();
        for (const row of rows) {
            for (const line of row.lines) {
                const g = nomAgg.get(line.item) ?? { totalQty: 0, totalAmount: 0 };
                g.totalQty += line.qty;
                g.totalAmount += line.amount;
                nomAgg.set(line.item, g);
            }
        }
        const byNomenclature = [...nomAgg.entries()]
            .map(([item, v]) => ({ item, totalQty: r2(v.totalQty), totalAmount: r2(v.totalAmount) }))
            .sort((a, b) => b.totalAmount - a.totalAmount);
        const totals = {
            amount: r2(rows.reduce((s, r) => s + r.totalAmount, 0)),
            vatAmount: r2(rows.flatMap(r => r.lines).reduce((s, l) => s + l.vatAmount, 0)),
            docs: rows.length,
            lines: rows.reduce((s, r) => s + r.lines.length, 0),
        };
        return { rows, totals, byNomenclature };
    }
    // ── Contractor group consolidated balance ─────────────────────────────────
    // Aggregates balances across multiple contractor GUIDs (e.g. entire SSA group).
    async getGroupBalance(contractorGuids, groupLabel, date) {
        const asOf = date ?? new Date().toISOString().slice(0, 10);
        // Resolve all member names
        const nameMap = await this.resolveNames(contractorGuids);
        const members = contractorGuids.map(g => ({ guid: g, name: nameMap.get(g) ?? g.slice(0, 8) }));
        // Fetch all accounts chart
        const accounts = await this.client.getCollection("ChartOfAccounts_Типовой", { select: "Ref_Key,Code,Description", top: 1000 });
        const accMap = new Map(accounts.map(a => [a.Ref_Key, { code: a.Code ?? "", name: a.Description ?? "" }]));
        // Pull full balance register and filter client-side for all GUIDs in the group
        const balRows = await this.client.getRegisterBalance("AccountingRegister_Типовой", {
            select: "Account_Key,ExtDimension1,ExtDimension2,СуммаBalanceDr,СуммаBalanceCr",
            top: 10000,
            ...(date ? { Period: `${date}T23:59:59` } : {}),
        });
        const guidSet = new Set(contractorGuids);
        const groupRows = balRows.filter(r => (r.ExtDimension1 && guidSet.has(r.ExtDimension1)) ||
            (r.ExtDimension2 && guidSet.has(r.ExtDimension2)));
        // Aggregate by account
        const byAcc = new Map();
        for (const r of groupRows) {
            const key = r.Account_Key ?? "";
            const g = byAcc.get(key) ?? { dr: 0, cr: 0 };
            g.dr += r.СуммаBalanceDr ?? 0;
            g.cr += r.СуммаBalanceCr ?? 0;
            byAcc.set(key, g);
        }
        const accountList = [...byAcc.entries()]
            .map(([guid, v]) => {
            const acc = accMap.get(guid) ?? { code: "?", name: "?" };
            return {
                accountCode: acc.code,
                accountName: acc.name,
                balanceDr: r2(v.dr),
                balanceCr: r2(v.cr),
                net: r2(v.dr - v.cr),
            };
        })
            .filter(r => r.balanceDr !== 0 || r.balanceCr !== 0)
            .sort((a, b) => a.accountCode.localeCompare(b.accountCode, undefined, { numeric: true }));
        const totals = {
            balanceDr: r2(accountList.reduce((s, r) => s + r.balanceDr, 0)),
            balanceCr: r2(accountList.reduce((s, r) => s + r.balanceCr, 0)),
            net: r2(accountList.reduce((s, r) => s + r.net, 0)),
        };
        return { groupLabel, asOfDate: asOf, members, accounts: accountList, totals };
    }
    // ── Sales report: line-level detail mirroring purchases report ───────────
    async getSalesReport(dateFrom, dateTo, contractorGuid, organizationGuid) {
        const filters = [
            "Posted eq true", "DeletionMark eq false",
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (contractorGuid)
            filters.push(`Контрагент_Key eq guid'${contractorGuid}'`);
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const docs = await this.client.getCollection("Document_РеализацияТоваровУслуг", {
            filter: filters.join(" and "),
            select: "Ref_Key,Date,Number,Контрагент_Key,ДоговорКонтрагента_Key,ВалютаДокумента_Key",
            orderby: "Date asc",
            top: 2000,
        });
        if (!docs.length)
            return { rows: [], totals: { amount: 0, vatAmount: 0, total: 0 } };
        const docGuids = docs.map(d => d.Ref_Key);
        const docMap = new Map(docs.map(d => [d.Ref_Key, d]));
        const fetchLines = async (suffix) => {
            const BATCH = 20;
            const all = [];
            for (let i = 0; i < docGuids.length; i += BATCH) {
                const batch = docGuids.slice(i, i + BATCH);
                const r = await this.client.getCollection(`Document_РеализацияТоваровУслуг_${suffix}`, {
                    filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "),
                    select: "Ref_Key,Номенклатура_Key,Количество,ЕдиницаИзмерения_Key,Цена,Сумма,СуммаНДС",
                    top: BATCH * 50,
                }).catch(() => []);
                all.push(...r);
            }
            return all;
        };
        const [tovRows, svcRows] = await Promise.all([fetchLines("Товары"), fetchLines("Услуги")]);
        const allLineRows = [...tovRows, ...svcRows];
        const contrGuids = [...new Set(docs.map(d => d.Контрагент_Key).filter(Boolean))];
        const contractGuids = [...new Set(docs.map(d => d.ДоговорКонтрагента_Key).filter(Boolean))];
        const currGuids = [...new Set(docs.map(d => d.ВалютаДокумента_Key).filter(Boolean))];
        const nomGuids = [...new Set(allLineRows.map(r => r.Номенклатура_Key).filter(Boolean))];
        const loadNames = async (guids, entity) => {
            const map = new Map();
            const BATCH = 10;
            for (let i = 0; i < guids.length; i += BATCH) {
                const batch = guids.slice(i, i + BATCH);
                const rows = await this.client.getCollection(entity, { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH }).catch(() => []);
                for (const r of rows)
                    map.set(r.Ref_Key, r.Description);
            }
            return map;
        };
        const [contrNames, contractNames, currNames, nomNames] = await Promise.all([
            this.resolveNames(contrGuids),
            loadNames(contractGuids, "Catalog_ДоговорыКонтрагентов"),
            loadNames(currGuids, "Catalog_Валюты"),
            loadNames(nomGuids, "Catalog_Номенклатура"),
        ]);
        const rows = [];
        const addRows = (lineRows, lineType) => {
            for (const row of lineRows) {
                const doc = docMap.get(row.Ref_Key);
                if (!doc)
                    continue;
                const amount = row.Сумма ?? 0;
                const vatAmount = row.СуммаНДС ?? 0;
                const pct = vatAmount === 0 ? "0%" : amount <= 0 ? "НДС" : `${Math.round((vatAmount / amount) * 100)}%`;
                rows.push({
                    date: doc.Date?.slice(0, 10) ?? "",
                    docNumber: doc.Number ?? "",
                    contractor: contrNames.get(doc.Контрагент_Key ?? "") ?? "",
                    contract: contractNames.get(doc.ДоговорКонтрагента_Key ?? "") ?? "",
                    currency: currNames.get(doc.ВалютаДокумента_Key ?? "") ?? "",
                    lineType,
                    item: nomNames.get(row.Номенклатура_Key ?? "") ?? "",
                    qty: row.Количество ?? 0,
                    uom: "",
                    price: row.Цена ?? 0,
                    amount,
                    vatPct: pct,
                    vatAmount,
                    total: amount + vatAmount,
                    docGuid: row.Ref_Key,
                });
            }
        };
        addRows(tovRows, "Товар");
        addRows(svcRows, "Услуга");
        rows.sort((a, b) => a.date.localeCompare(b.date));
        return {
            rows,
            totals: {
                amount: r2(rows.reduce((s, r) => s + r.amount, 0)),
                vatAmount: r2(rows.reduce((s, r) => s + r.vatAmount, 0)),
                total: r2(rows.reduce((s, r) => s + r.total, 0)),
            },
        };
    }
    // ── Cash flow summary: bank + cash in/out grouped by month ────────────────
    async getCashFlowSummary(dateFrom, dateTo, organizationGuid) {
        const baseFilters = [
            "DeletionMark eq false", "Posted eq true",
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (organizationGuid)
            baseFilters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const f = baseFilters.join(" and ");
        const [bankIn, bankOut, cashIn, cashOut] = await Promise.all([
            this.client.getCollection("Document_ПлатежноеПоручениеВходящее", { filter: f, select: "Date,СуммаДокумента", top: 5000 }).catch(() => []),
            this.client.getCollection("Document_ПлатежноеПоручениеИсходящее", { filter: f, select: "Date,СуммаДокумента", top: 5000 }).catch(() => []),
            this.client.getCollection("Document_КассовыйОрдерПриходный", { filter: f, select: "Date,СуммаДокумента", top: 5000 }).catch(() => []),
            this.client.getCollection("Document_КассовыйОрдерРасходный", { filter: f, select: "Date,СуммаДокумента", top: 5000 }).catch(() => []),
        ]);
        const monthMap = new Map();
        const addToMonth = (docs, isInflow) => {
            for (const d of docs) {
                const month = (d.Date ?? "").slice(0, 7);
                if (!month)
                    continue;
                const g = monthMap.get(month) ?? { inflow: 0, outflow: 0 };
                if (isInflow)
                    g.inflow += d.СуммаДокумента ?? 0;
                else
                    g.outflow += d.СуммаДокумента ?? 0;
                monthMap.set(month, g);
            }
        };
        addToMonth(bankIn, true);
        addToMonth(cashIn, true);
        addToMonth(bankOut, false);
        addToMonth(cashOut, false);
        const months = [...monthMap.entries()]
            .map(([month, v]) => ({ month, inflow: r2(v.inflow), outflow: r2(v.outflow), net: r2(v.inflow - v.outflow) }))
            .sort((a, b) => a.month.localeCompare(b.month));
        const sum = (docs) => r2(docs.reduce((s, d) => s + (d.СуммаДокумента ?? 0), 0));
        const totalInflow = r2(sum(bankIn) + sum(cashIn));
        const totalOutflow = r2(sum(bankOut) + sum(cashOut));
        return {
            months,
            totals: { inflow: totalInflow, outflow: totalOutflow, net: r2(totalInflow - totalOutflow) },
            byType: [
                { type: "Bank In (ПлатежноеПоручениеВходящее)", amount: sum(bankIn) },
                { type: "Bank Out (ПлатежноеПоручениеИсходящее)", amount: sum(bankOut) },
                { type: "Cash In (КассовыйОрдерПриходный)", amount: sum(cashIn) },
                { type: "Cash Out (КассовыйОрдерРасходный)", amount: sum(cashOut) },
            ],
        };
    }
    // ── Fixed assets: 2410 (cost) / 2420 (depreciation) ─────────────────────
    async getFixedAssets(organizationGuid, date) {
        const asOf = date ?? new Date().toISOString().slice(0, 10);
        const accRows = await this.client.getCollection("ChartOfAccounts_Типовой", { filter: "Code eq '2410' or Code eq '2420'", select: "Ref_Key,Code", top: 10 });
        const acc2410 = accRows.find(a => a.Code === "2410");
        const acc2420 = accRows.find(a => a.Code === "2420");
        const buildFilter = (accGuid) => {
            const f = [`Account_Key eq guid'${accGuid}'`];
            if (organizationGuid)
                f.push(`Организация_Key eq guid'${organizationGuid}'`);
            return f.join(" and ");
        };
        const [rows2410, rows2420] = await Promise.all([
            acc2410 ? this.client.getRegisterBalance("AccountingRegister_Типовой", {
                filter: buildFilter(acc2410.Ref_Key),
                select: "ExtDimension1,СуммаBalanceDr,СуммаBalanceCr",
                top: 2000,
                ...(date ? { Period: `${date}T23:59:59` } : {}),
            }) : Promise.resolve([]),
            acc2420 ? this.client.getRegisterBalance("AccountingRegister_Типовой", {
                filter: buildFilter(acc2420.Ref_Key),
                select: "ExtDimension1,СуммаBalanceDr,СуммаBalanceCr",
                top: 2000,
                ...(date ? { Period: `${date}T23:59:59` } : {}),
            }) : Promise.resolve([]),
        ]);
        const costMap = new Map();
        for (const r of rows2410) {
            const g = r.ExtDimension1 ?? "_other";
            costMap.set(g, (costMap.get(g) ?? 0) + (r.СуммаBalanceDr ?? 0) - (r.СуммаBalanceCr ?? 0));
        }
        const deprMap = new Map();
        for (const r of rows2420) {
            const g = r.ExtDimension1 ?? "_other";
            deprMap.set(g, (deprMap.get(g) ?? 0) + (r.СуммаBalanceCr ?? 0) - (r.СуммаBalanceDr ?? 0));
        }
        const allGuids = [...new Set([...costMap.keys(), ...deprMap.keys()])].filter(g => g !== "_other");
        const nameMap = new Map();
        const BATCH = 10;
        for (let i = 0; i < allGuids.length; i += BATCH) {
            const batch = allGuids.slice(i, i + BATCH);
            const items = await this.client.getCollection("Catalog_ОсновныеСредства", { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH }).catch(() => []);
            for (const item of items)
                nameMap.set(item.Ref_Key, item.Description);
        }
        const rows = allGuids
            .map(guid => {
            const initialCost = r2(costMap.get(guid) ?? 0);
            const accumulatedDepreciation = r2(deprMap.get(guid) ?? 0);
            return { guid, name: nameMap.get(guid) ?? guid.slice(0, 8), initialCost, accumulatedDepreciation, residualValue: r2(initialCost - accumulatedDepreciation) };
        })
            .filter(r => r.initialCost !== 0 || r.accumulatedDepreciation !== 0)
            .sort((a, b) => b.initialCost - a.initialCost);
        return {
            asOfDate: asOf,
            rows,
            totals: {
                initialCost: r2(rows.reduce((s, r) => s + r.initialCost, 0)),
                accumulatedDepreciation: r2(rows.reduce((s, r) => s + r.accumulatedDepreciation, 0)),
                residualValue: r2(rows.reduce((s, r) => s + r.residualValue, 0)),
            },
        };
    }
    // ── Payroll documents: НачислениеЗарплатыРаботникамОрганизаций ───────────
    async getPayrollDocuments(dateFrom, dateTo, organizationGuid) {
        const filters = [
            "Posted eq true", "DeletionMark eq false",
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const payrollDocs = await this.client.getCollection("Document_НачислениеЗарплатыРаботникамОрганизаций", {
            filter: filters.join(" and "),
            select: "Ref_Key,Date,Number,СуммаДокумента,Период",
            orderby: "Date desc",
            top: 100,
        }).catch(() => []);
        if (!payrollDocs.length)
            return { docs: [], totals: { totalAmount: 0, docs: 0 } };
        const docGuids = payrollDocs.map(d => d.Ref_Key);
        const BATCH = 10;
        const allLines = [];
        for (let i = 0; i < docGuids.length; i += BATCH) {
            const batch = docGuids.slice(i, i + BATCH);
            const r = await this.client.getCollection("Document_НачислениеЗарплатыРаботникамОрганизаций_Начисления", { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,ФизЛицо_Key,ВидНачисления,Результат", top: BATCH * 100 }).catch(() => []);
            allLines.push(...r);
        }
        const empGuids = [...new Set(allLines.map(l => l.ФизЛицо_Key).filter(Boolean))];
        const empNames = new Map();
        for (let i = 0; i < empGuids.length; i += BATCH) {
            const batch = empGuids.slice(i, i + BATCH);
            const rows = await this.client.getCollection("Catalog_ФизическиеЛица", { filter: batch.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH }).catch(() => []);
            for (const r of rows)
                empNames.set(r.Ref_Key, r.Description);
        }
        const linesByDoc = new Map();
        for (const line of allLines) {
            if (!linesByDoc.has(line.Ref_Key))
                linesByDoc.set(line.Ref_Key, []);
            linesByDoc.get(line.Ref_Key).push(line);
        }
        const docs = payrollDocs.map(d => {
            const lines = (linesByDoc.get(d.Ref_Key) ?? []).map(l => ({
                employeeName: empNames.get(l.ФизЛицо_Key ?? "") ?? l.ФизЛицо_Key?.slice(0, 8) ?? "",
                accrualType: String(l.ВидНачисления ?? ""),
                amount: l.Результат ?? 0,
            }));
            return {
                docGuid: d.Ref_Key,
                date: d.Date?.slice(0, 10) ?? "",
                number: d.Number ?? "",
                period: d.Период?.slice(0, 7) ?? "",
                totalAmount: d.СуммаДокумента ?? 0,
                employeeCount: new Set(lines.map(l => l.employeeName)).size,
                lines,
            };
        });
        return {
            docs,
            totals: { totalAmount: r2(docs.reduce((s, d) => s + d.totalAmount, 0)), docs: docs.length },
        };
    }
    // ── Stock report: current inventory with procurement prices ───────────────
    async getStockReport(organizationGuid, dateTo, warehouseGuid, dateFrom) {
        const asOf = dateTo ?? new Date().toISOString().slice(0, 10);
        // ── Step 1: Resolve stock account GUIDs (1310 Materials, 1320 Finished goods, 1330 Goods) ──
        const stockAccounts = await this.client.getCollection("ChartOfAccounts_Типовой", { filter: "Code eq '1310' or Code eq '1320' or Code eq '1330'", select: "Ref_Key,Code", top: 10 });
        const defaultFromDate = new Date(asOf);
        defaultFromDate.setFullYear(defaultFromDate.getFullYear() - 1);
        const resolvedDateFrom = dateFrom ?? defaultFromDate.toISOString().slice(0, 10);
        if (!stockAccounts.length)
            return { asOfDate: asOf, procurementWindow: { from: resolvedDateFrom, to: asOf }, rows: [], totals: { totalCostValue: 0, itemCount: 0, zeroStockItems: 0 } };
        const accCodeMap = new Map(stockAccounts.map(a => [a.Ref_Key, a.Code]));
        // ── Step 2: Fetch balance from AccountingRegister_Типовой ─────────────────
        // ExtDimension1 = Nomenclature, ExtDimension2 = Warehouse
        const accFilter = stockAccounts.map(a => `Account_Key eq guid'${a.Ref_Key}'`).join(" or ");
        const filters = [`(${accFilter})`];
        if (organizationGuid)
            filters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const balanceRows = await this.client.getRegisterBalance("AccountingRegister_Типовой", {
            filter: filters.join(" and "),
            top: 5000,
            ...(asOf ? { Period: `${asOf}T23:59:59` } : {}),
        });
        const byNom = new Map();
        for (const r of balanceRows) {
            // Only include rows where ExtDimension1 is Nomenclature
            if (!r.ExtDimension1_Type?.includes("Catalog_Номенклатура"))
                continue;
            const nomKey = r.ExtDimension1 ?? "";
            if (!nomKey)
                continue;
            if (warehouseGuid && r.ExtDimension2 !== warehouseGuid)
                continue;
            const qty = (r.КоличествоBalanceDr ?? 0) - (r.КоличествоBalanceCr ?? 0);
            const cost = (r.СуммаBalanceDr ?? 0) - (r.СуммаBalanceCr ?? 0);
            const agg = byNom.get(nomKey) ?? { totalQty: 0, totalCost: 0, accountCode: accCodeMap.get(r.Account_Key ?? "") ?? "", warehouses: new Map() };
            agg.totalQty += qty;
            agg.totalCost += cost;
            if (!agg.accountCode)
                agg.accountCode = accCodeMap.get(r.Account_Key ?? "") ?? "";
            const wKey = r.ExtDimension2 ?? "";
            const wAgg = agg.warehouses.get(wKey) ?? { qty: 0, cost: 0 };
            wAgg.qty += qty;
            wAgg.cost += cost;
            agg.warehouses.set(wKey, wAgg);
            byNom.set(nomKey, agg);
        }
        if (!byNom.size) {
            return { asOfDate: asOf, procurementWindow: { from: resolvedDateFrom, to: asOf }, rows: [], totals: { totalCostValue: 0, itemCount: 0, zeroStockItems: 0 } };
        }
        // ── Step 2: Resolve nomenclature names, articles, units ─────────────────
        const nomGuids = [...byNom.keys()].filter(Boolean);
        const BATCH = 10;
        const nomDetails = new Map();
        for (let i = 0; i < nomGuids.length; i += BATCH) {
            const chunk = nomGuids.slice(i, i + BATCH);
            const filter = chunk.map(g => `Ref_Key eq guid'${g}'`).join(" or ");
            const rows = await this.client.getCollection("Catalog_Номенклатура", {
                filter, select: "Ref_Key,Description,Артикул,БазоваяЕдиницаИзмерения_Key", top: BATCH,
            }).catch(() => []);
            for (const r of rows) {
                nomDetails.set(r.Ref_Key, {
                    name: r.Description ?? "",
                    article: r.Артикул ?? "",
                    unitKey: r.БазоваяЕдиницаИзмерения_Key ?? "",
                });
            }
        }
        // Resolve unit names
        const unitGuids = [...new Set([...nomDetails.values()].map(n => n.unitKey).filter(Boolean))];
        const unitNames = new Map();
        for (let i = 0; i < unitGuids.length; i += BATCH) {
            const chunk = unitGuids.slice(i, i + BATCH);
            const rows = await this.client.getCollection("Catalog_ЕдиницыИзмерения", { filter: chunk.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH }).catch(() => []);
            for (const r of rows)
                unitNames.set(r.Ref_Key, r.Description);
        }
        // Resolve warehouse names
        const whGuids = [...new Set(balanceRows.map(r => r.ExtDimension2).filter(Boolean))];
        const whNames = new Map();
        for (let i = 0; i < whGuids.length; i += BATCH) {
            const chunk = whGuids.slice(i, i + BATCH);
            const rows = await this.client.getCollection("Catalog_Склады", { filter: chunk.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH }).catch(() => []);
            for (const r of rows)
                whNames.set(r.Ref_Key, r.Description);
        }
        // ── Step 3: Last procurement price per nomenclature ──────────────────────
        const purchaseFrom = resolvedDateFrom;
        const purchaseFilters = [
            "Posted eq true", "DeletionMark eq false",
            `Date ge datetime'${purchaseFrom}T00:00:00'`,
            `Date le datetime'${asOf}T23:59:59'`,
        ];
        if (organizationGuid)
            purchaseFilters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const purchaseDocs = await this.client.getCollection("Document_ПоступлениеТоваровУслуг", {
            filter: purchaseFilters.join(" and "),
            select: "Ref_Key,Date,Number,Контрагент_Key",
            orderby: "Date asc",
            top: 1000,
        }).catch(() => []);
        // Map: docGuid → { date, number, supplierGuid }
        const docMeta = new Map(purchaseDocs.map(d => [d.Ref_Key, {
                date: d.Date?.slice(0, 10) ?? "",
                number: d.Number ?? "",
                supplierGuid: d.Контрагент_Key ?? "",
            }]));
        // Resolve supplier names
        const supplierGuids = [...new Set(purchaseDocs.map(d => d.Контрагент_Key).filter(Boolean))];
        const supplierNames = new Map();
        for (let i = 0; i < supplierGuids.length; i += BATCH) {
            const chunk = supplierGuids.slice(i, i + BATCH);
            const rows = await this.client.getCollection("Catalog_Контрагенты", { filter: chunk.map(g => `Ref_Key eq guid'${g}'`).join(" or "), select: "Ref_Key,Description", top: BATCH }).catch(() => []);
            for (const r of rows)
                supplierNames.set(r.Ref_Key, r.Description);
        }
        const purchaseLines = [];
        const docGuids = purchaseDocs.map(d => d.Ref_Key);
        for (let i = 0; i < docGuids.length; i += BATCH) {
            const chunk = docGuids.slice(i, i + BATCH);
            const rows = await this.client.getCollection("Document_ПоступлениеТоваровУслуг_Товары", {
                filter: chunk.map(g => `Ref_Key eq guid'${g}'`).join(" or "),
                select: "Ref_Key,Номенклатура_Key,Цена,Количество",
                top: BATCH * 100,
            }).catch(() => []);
            purchaseLines.push(...rows);
        }
        const lastPurchase = new Map();
        for (const line of purchaseLines) {
            const nomKey = line.Номенклатура_Key ?? "";
            if (!nomKey || !byNom.has(nomKey))
                continue;
            const meta = docMeta.get(line.Ref_Key);
            if (!meta)
                continue;
            const existing = lastPurchase.get(nomKey);
            if (!existing || meta.date > existing.date) {
                lastPurchase.set(nomKey, {
                    price: line.Цена ?? 0,
                    date: meta.date,
                    docNumber: meta.number,
                    supplierGuid: meta.supplierGuid,
                    supplierName: supplierNames.get(meta.supplierGuid) ?? "",
                });
            }
        }
        // ── Step 4: Assemble rows ────────────────────────────────────────────────
        const rows = nomGuids.map(nomGuid => {
            const agg = byNom.get(nomGuid);
            const nom = nomDetails.get(nomGuid);
            const lp = lastPurchase.get(nomGuid);
            const avgCostPrice = agg.totalQty !== 0 ? r2(agg.totalCost / agg.totalQty) : 0;
            const warehouses = [...agg.warehouses.entries()]
                .map(([wGuid, wAgg]) => ({
                warehouseGuid: wGuid,
                warehouseName: whNames.get(wGuid) ?? wGuid.slice(0, 8),
                quantity: r2(wAgg.qty),
                costValue: r2(wAgg.cost),
            }))
                .filter(w => w.quantity !== 0 || w.costValue !== 0)
                .sort((a, b) => b.quantity - a.quantity);
            return {
                nomenclatureGuid: nomGuid,
                nomenclatureName: nom?.name ?? nomGuid.slice(0, 8),
                articleCode: nom?.article ?? "",
                accountCode: agg.accountCode,
                unit: unitNames.get(nom?.unitKey ?? "") ?? "",
                quantity: r2(agg.totalQty),
                totalCostValue: r2(agg.totalCost),
                avgCostPrice,
                lastProcurementPrice: lp?.price ?? null,
                lastProcurementDate: lp?.date ?? null,
                lastProcurementDocNumber: lp?.docNumber ?? null,
                lastSupplierGuid: lp?.supplierGuid ?? null,
                lastSupplierName: lp?.supplierName ?? null,
                warehouses,
            };
        }).sort((a, b) => b.totalCostValue - a.totalCostValue);
        const nonZero = rows.filter(r => r.quantity > 0);
        const zeroItems = rows.filter(r => r.quantity <= 0).length;
        const totalCostValue = r2(nonZero.reduce((s, r) => s + r.totalCostValue, 0));
        return {
            asOfDate: asOf,
            procurementWindow: { from: purchaseFrom, to: asOf },
            rows,
            totals: { totalCostValue, itemCount: nonZero.length, zeroStockItems: zeroItems },
        };
    }
    async getSettlementBreakdown(accountCodes, organizationGuid, date) {
        const { rows, byAccount } = await this.getSettlementRows(accountCodes, organizationGuid, date);
        const sorted = rows.slice().sort((a, b) => (b.balanceDr - b.balanceCr) - (a.balanceDr - a.balanceCr));
        return { rows: sorted, byAccount };
    }
}
//# sourceMappingURL=ReportsService.js.map