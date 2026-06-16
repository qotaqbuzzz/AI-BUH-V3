// КЗ 2026 constants
const MRP_2026 = 3692; // Месячный расчётный показатель
const MZP_2026 = 85000; // Минимальная заработная плата
const STANDARD_DEDUCTION_MRP = 14; // 14 МРП стандартный вычет ИПН
export class AgroProductionService {
    client;
    register;
    constructor(client, register) {
        this.client = client;
        this.register = register;
    }
    async getProductionCosts(organizationGuid, date) {
        const bal = await this.register.getAccountBalance("8110", organizationGuid, date);
        return {
            account: "8110 Основное производство",
            debitBalance: bal.debitBalance,
            creditBalance: bal.creditBalance,
            wipBalance: bal.netBalance,
            description: "Незавершённое производство (НЗП) — накопленные затраты посевного сезона",
        };
    }
    async getMaterialsBalance(organizationGuid, date, nomenclatureGuid) {
        const inventory = await this.register.getInventoryBalance(organizationGuid, nomenclatureGuid, date);
        const totalCost = inventory.reduce((s, r) => s + (r.СтоимостьBalance ?? 0), 0);
        return { account: "1310 Сырьё и материалы", inventory, totalCost };
    }
    async getHarvestOutput(organizationGuid, date) {
        const bal = await this.register.getAccountBalance("1320", organizationGuid, date);
        return {
            account: "1320 Готовая продукция",
            debitBalance: bal.debitBalance,
            creditBalance: bal.creditBalance,
            stockBalance: bal.netBalance,
        };
    }
    async getPayrollTaxesSummary(organizationGuid, dateFrom, dateTo) {
        const [opv, so, vosms, ipn] = await Promise.all([
            this.client.getCollection("AccumulationRegister_ОПВРасчетыСФондами_Balance", {
                filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
                top: 500,
            }),
            this.client.getCollection("AccumulationRegister_СОРасчетыСФондами_Balance", {
                filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
                top: 500,
            }),
            this.client.getCollection("AccumulationRegister_ВОСМСРасчетыСФондами_Balance", {
                filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
                top: 500,
            }).catch(() => []),
            this.client.getCollection("AccumulationRegister_ИПНРасчетыСБюджетом_Balance", {
                filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
                top: 500,
            }).catch(() => []),
        ]);
        return { opv, so, vosms, ipn, period: { dateFrom, dateTo } };
    }
    async getVatRegister(organizationGuid, dateFrom, dateTo) {
        return this.client.getCollection("AccumulationRegister_НДС_Balance", {
            filter: `Организация_Key eq guid'${organizationGuid}' and Period ge datetime'${dateFrom}T00:00:00' and Period le datetime'${dateTo}T23:59:59'`,
            top: 500,
        });
    }
    async getAgroPLSummary(organizationGuid, dateFrom, dateTo) {
        const [rev, cogs, overhead] = await Promise.all([
            this.register.getAccountTurnovers("6010", dateFrom, dateTo, organizationGuid),
            this.register.getAccountTurnovers("7010", dateFrom, dateTo, organizationGuid),
            this.register.getAccountTurnovers("7210", dateFrom, dateTo, organizationGuid),
        ]);
        const revenue = rev.creditTurnover;
        const cogsAmt = cogs.debitTurnover;
        const overheadAmt = overhead.debitTurnover;
        const grossProfit = revenue - cogsAmt;
        const operatingProfit = grossProfit - overheadAmt;
        return {
            revenue,
            cogs: cogsAmt,
            grossProfit,
            overhead: overheadAmt,
            operatingProfit,
            revenueAccount: "6010 Доход от реализации",
            cogsAccount: "7010 Себестоимость реализованной продукции",
            overheadAccount: "7210 Административные расходы",
        };
    }
    calculatePayrollTaxes(grossSalary, hasDeductions = true) {
        // Worker deductions
        const opv = Math.round(grossSalary * 0.10);
        const oosms = Math.round(grossSalary * 0.02);
        // ИПН taxable base = gross - ОПВ - ООСМС - standard deduction
        const standardDeduction = hasDeductions ? STANDARD_DEDUCTION_MRP * MRP_2026 : 0;
        const taxableBase = Math.max(0, grossSalary - opv - oosms - standardDeduction);
        const ipn = Math.round(taxableBase * 0.10);
        const netSalary = grossSalary - opv - oosms - ipn;
        // Employer charges
        const oppv = Math.round(grossSalary * 0.05);
        const so = Math.round(grossSalary * 0.035);
        const vosms = Math.round(grossSalary * 0.03);
        // СН = 9.5% − СО (Article 486 НК РК)
        const sn = Math.max(0, Math.round(grossSalary * 0.095) - so);
        const totalEmployerCost = grossSalary + oppv + so + vosms + sn;
        return { grossSalary, opv, oosms, taxableBase, standardDeduction, ipn, netSalary, oppv, so, vosms, sn, totalEmployerCost };
    }
    async getKPNEstimate(organizationGuid, dateFrom, dateTo) {
        const [rev, cogs, overhead, taxExpense] = await Promise.all([
            this.register.getAccountTurnovers("6010", dateFrom, dateTo, organizationGuid),
            this.register.getAccountTurnovers("7010", dateFrom, dateTo, organizationGuid),
            this.register.getAccountTurnovers("7210", dateFrom, dateTo, organizationGuid),
            this.register.getAccountTurnovers("7710", dateFrom, dateTo, organizationGuid),
        ]);
        const revenue = rev.creditTurnover;
        const totalExpenses = cogs.debitTurnover + overhead.debitTurnover + taxExpense.debitTurnover;
        const taxableProfit = Math.max(0, revenue - totalExpenses);
        const kpnBase = taxableProfit;
        const kpnRate = 0.20;
        // Agro reduction: 70% (Article 285 НК РК)
        const agroReduction = Math.round(kpnBase * kpnRate * 0.70);
        const kpnPayable = Math.max(0, Math.round(kpnBase * kpnRate) - agroReduction);
        return { revenue, totalExpenses, taxableProfit, kpnBase, kpnRate, agroReduction, kpnPayable };
    }
}
//# sourceMappingURL=AgroProductionService.js.map