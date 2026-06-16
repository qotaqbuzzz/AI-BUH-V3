import { add, emptyReport, finalize } from "./types.js";
export class ReconciliationValidator {
    client;
    register;
    constructor(client, register) {
        this.client = client;
        this.register = register;
    }
    async validateInvoicePaymentMatching(date, organizationGuid, agingDaysWarn = 60) {
        const start = Date.now();
        const report = emptyReport("ReconciliationValidator.invoicePaymentMatching", { from: date, to: date }, organizationGuid);
        // A/R 1210 — customers owe us
        const ar = await this.register.getAccountBreakdown("1210", date, organizationGuid).catch(() => []);
        const arTotal = ar.reduce((s, b) => s + (b.amountDr ?? 0) - (b.amountCr ?? 0), 0);
        const arDebtors = ar.filter(b => (b.amountDr ?? 0) - (b.amountCr ?? 0) > 0);
        if (arDebtors.length > 0) {
            const top = arDebtors
                .map(b => ({ name: b.dim1Name || b.dim1.slice(0, 8) + "…", guid: b.dim1, amount: (b.amountDr ?? 0) - (b.amountCr ?? 0) }))
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);
            add(report, {
                ruleId: "REC-001",
                ruleName: "Outstanding A/R",
                severity: arTotal > 100_000_000 ? "warn" : "info",
                category: "reconciliation",
                description: `A/R (1210): ${arDebtors.length} дебиторов на сумму ${arTotal.toFixed(2)} ₸.`,
                affected: { accountCode: "1210", actual: arTotal, extras: { debtorCount: arDebtors.length, topDebtors: JSON.stringify(top) } },
                suggestedFix: `Проверить просрочку > ${agingDaysWarn} дней по топ-должникам через onec_get_contractor_settlements или onec_get_contractor_balance.`,
                ruleSource: "kz-agro-validation-rules.md#A.6",
            });
        }
        // A/P 3310 — we owe suppliers
        const ap = await this.register.getAccountBreakdown("3310", date, organizationGuid).catch(() => []);
        const apTotal = ap.reduce((s, b) => s + (b.amountCr ?? 0) - (b.amountDr ?? 0), 0);
        const apCreditors = ap.filter(b => (b.amountCr ?? 0) - (b.amountDr ?? 0) > 0);
        if (apCreditors.length > 0) {
            const top = apCreditors
                .map(b => ({ name: b.dim1Name || b.dim1.slice(0, 8) + "…", guid: b.dim1, amount: (b.amountCr ?? 0) - (b.amountDr ?? 0) }))
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);
            add(report, {
                ruleId: "REC-001a",
                ruleName: "Outstanding A/P",
                severity: apTotal > 100_000_000 ? "warn" : "info",
                category: "reconciliation",
                description: `A/P (3310): ${apCreditors.length} кредиторов на сумму ${apTotal.toFixed(2)} ₸.`,
                affected: { accountCode: "3310", actual: apTotal, extras: { creditorCount: apCreditors.length, topCreditors: JSON.stringify(top) } },
                suggestedFix: "Проверить условия оплаты по контрактам, использовать onec_get_creditors_detailed.",
                ruleSource: "kz-agro-validation-rules.md#A.6",
            });
        }
        return finalize(report, start);
    }
    async validateContractTermsCompliance(dateFrom, dateTo, organizationGuid) {
        const start = Date.now();
        const report = emptyReport("ReconciliationValidator.contractTerms", { from: dateFrom, to: dateTo }, organizationGuid);
        // High-level check: are there any contracts with payment terms in the period
        // Detailed per-contract aging requires per-contract drill-down — flag for ad-hoc analysis
        const contracts = await this.client.getCollection("Catalog_ДоговорыКонтрагентов", { filter: "DeletionMark eq false", select: "Ref_Key,Description,СрокДействияС,СрокДействияПо", top: 500 }).catch(() => []);
        if (contracts.length === 0) {
            add(report, {
                ruleId: "REC-002",
                ruleName: "No contracts to check",
                severity: "info",
                category: "reconciliation",
                description: "Договоры контрагентов не найдены.",
                affected: {},
                suggestedFix: "Нет действий.",
                ruleSource: "kz-agro-validation-rules.md#A.6",
            });
            return finalize(report, start);
        }
        const periodEnd = new Date(dateTo);
        const expired = contracts.filter(c => {
            if (!c.СрокДействияПо)
                return false;
            try {
                return new Date(c.СрокДействияПо) < periodEnd;
            }
            catch {
                return false;
            }
        });
        if (expired.length > 0) {
            add(report, {
                ruleId: "REC-002a",
                ruleName: "Expired contracts",
                severity: "warn",
                category: "reconciliation",
                description: `${expired.length} из ${contracts.length} договоров истекли до ${dateTo}.`,
                affected: { actual: expired.length, expected: 0, extras: { totalContracts: contracts.length } },
                suggestedFix: `Продлить или закрыть. Примеры: ${expired.slice(0, 3).map(c => `${c.Description} (до ${c.СрокДействияПо?.slice(0, 10)})`).join("; ")}.`,
                ruleSource: "kz-agro-validation-rules.md#A.6",
            });
        }
        else {
            add(report, {
                ruleId: "REC-002-ok",
                ruleName: "No expired contracts",
                severity: "info",
                category: "reconciliation",
                description: `Проверено ${contracts.length} договоров — истёкших нет.`,
                affected: { actual: contracts.length },
                suggestedFix: "OK.",
                ruleSource: "kz-agro-validation-rules.md#A.6",
            });
        }
        return finalize(report, start);
    }
    async validateBankBalanceConsistency(dateFrom, dateTo, organizationGuid) {
        const start = Date.now();
        const report = emptyReport("ReconciliationValidator.bankBalance", { from: dateFrom, to: dateTo }, organizationGuid);
        // 1. 1030 closing balance ≥ 0
        const b1030 = await this.register.getAccountBalance("1030", organizationGuid, dateTo).catch(() => null);
        if (b1030) {
            const net = b1030.netBalance;
            if (net < 0) {
                add(report, {
                    ruleId: "REC-003",
                    ruleName: "Negative bank balance",
                    severity: "critical",
                    category: "reconciliation",
                    description: `Счёт 1030: остаток ${net.toFixed(2)} ₸ < 0.`,
                    affected: { accountCode: "1030", actual: net, expected: 0 },
                    suggestedFix: "Проверить хронологию платежей. Возможно: оплата без поступления средств, или нарушен порядок проведения.",
                    ruleSource: "kz-agro-validation-rules.md#A.6",
                });
            }
            else {
                add(report, {
                    ruleId: "REC-003a",
                    ruleName: "Bank balance positive",
                    severity: "info",
                    category: "reconciliation",
                    description: `1030 = ${net.toFixed(2)} ₸.`,
                    affected: { accountCode: "1030", actual: net },
                    suggestedFix: "OK.",
                    ruleSource: "kz-agro-validation-rules.md#A.6",
                });
            }
        }
        // 2. Unpaid posted outgoing payments (Оплачено=false but Posted=true)
        const payFilters = [
            `Posted eq true`,
            `DeletionMark eq false`,
            `Оплачено eq false`,
            `Date ge datetime'${dateFrom}T00:00:00'`,
            `Date le datetime'${dateTo}T23:59:59'`,
        ];
        if (organizationGuid)
            payFilters.push(`Организация_Key eq guid'${organizationGuid}'`);
        const unpaid = await this.client.getCollection("Document_ПлатежноеПоручениеИсходящее", { filter: payFilters.join(" and "), select: "Ref_Key,Number,Date,СуммаДокумента", top: 100 }).catch(() => []);
        if (unpaid.length > 0) {
            const total = unpaid.reduce((s, r) => s + (r.СуммаДокумента ?? 0), 0);
            add(report, {
                ruleId: "REC-003b",
                ruleName: "Posted-but-unpaid outgoing payments",
                severity: "warn",
                category: "reconciliation",
                description: `${unpaid.length} ПП исходящих проведены, но не оплачены (сумма ${total.toFixed(2)} ₸).`,
                affected: { actual: unpaid.length, expected: 0, extras: { totalAmount: total } },
                suggestedFix: `Подтвердить оплату из банка и установить Оплачено=true. Первые 5: ${unpaid.slice(0, 5).map(p => `${p.Number}=${p.СуммаДокумента.toFixed(0)} ₸`).join("; ")}.`,
                ruleSource: "kz-agro-validation-rules.md#A.6",
            });
        }
        return finalize(report, start);
    }
}
//# sourceMappingURL=ReconciliationValidator.js.map