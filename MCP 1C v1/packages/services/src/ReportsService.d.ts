import type { OneCClient } from "@aibos/onec-client";
export interface OSVRow {
    accountCode: string;
    accountName: string;
    openingDr: number;
    openingCr: number;
    turnoverDr: number;
    turnoverCr: number;
    closingDr: number;
    closingCr: number;
}
export interface SettlementRow {
    accountCode: string;
    contractorGuid: string;
    contractorName: string;
    balanceDr: number;
    balanceCr: number;
}
export interface AnomalyReport {
    manualEntries: {
        guid: string;
        date: string;
        number: string;
        amount: number;
        comment: string;
    }[];
    roundAmounts: {
        guid: string;
        date: string;
        number: string;
        amount: number;
        docType: string;
    }[];
    unposted: {
        docType: string;
        count: number;
    }[];
    summary: {
        manual: number;
        round: number;
        unposted: number;
    };
}
export interface CreditorDetailRow {
    accountCode: string;
    contractorGuid: string;
    contractorName: string;
    balance: number;
    currency: string;
    firstDocDate: string | null;
    firstDocNumber: string | null;
    lastDocDate: string | null;
    contracts: string[];
    totalPaid2024to2026: number;
    lastPaymentDate: string | null;
    lastPaymentPurpose: string | null;
    ageCategory: "current" | "1y" | "2y" | "3y+" | "unknown";
    obligationType: "supplier_debt" | "advance_received" | "payroll";
}
export declare class ReportsService {
    private readonly client;
    constructor(client: OneCClient);
    getOSV(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<{
        rows: OSVRow[];
        totals: {
            openDr: number;
            openCr: number;
            turnDr: number;
            turnCr: number;
            closeDr: number;
            closeCr: number;
        };
    }>;
    private resolveNames;
    private getSettlementRows;
    getAllDebtors(organizationGuid?: string, date?: string): Promise<{
        rows: SettlementRow[];
        total: number;
        byAccount: Record<string, number>;
    }>;
    getAllCreditors(organizationGuid?: string, date?: string): Promise<{
        rows: SettlementRow[];
        total: number;
        byAccount: Record<string, number>;
    }>;
    getIncomingPayments(dateFrom: string, dateTo: string, contractorGuid?: string, organizationGuid?: string): Promise<{
        rows: {
            date: string;
            number: string;
            contractor: string;
            currency: string;
            amount: number;
            purpose: string;
            posted: boolean;
            docGuid: string;
        }[];
        totalByCurrency: Record<string, number>;
    }>;
    getOutgoingPayments(dateFrom: string, dateTo: string, contractorGuid?: string, organizationGuid?: string): Promise<{
        rows: {
            date: string;
            number: string;
            contractor: string;
            currency: string;
            amount: number;
            purpose: string;
            posted: boolean;
            docGuid: string;
        }[];
        totalByCurrency: Record<string, number>;
    }>;
    getPurchasesReport(dateFrom: string, dateTo: string, contractorGuid?: string, organizationGuid?: string): Promise<{
        rows: {
            date: string;
            docNumber: string;
            contractor: string;
            contract: string;
            currency: string;
            lineType: string;
            item: string;
            qty: number;
            uom: string;
            price: number;
            amount: number;
            vatPct: string;
            vatAmount: number;
            total: number;
            docGuid: string;
        }[];
        totals: {
            amount: number;
            vatAmount: number;
            total: number;
        };
    }>;
    getContractorBalance(contractorGuid: string, date?: string): Promise<{
        contractorName: string;
        rows: {
            accountCode: string;
            accountName: string;
            balanceDr: number;
            balanceCr: number;
            net: number;
        }[];
        totals: {
            balanceDr: number;
            balanceCr: number;
            net: number;
        };
    }>;
    detectAnomalies(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<AnomalyReport>;
    getDetailedCreditors(organizationGuid?: string, date?: string): Promise<{
        rows: CreditorDetailRow[];
        total: number;
        byAccount: Record<string, number>;
        asOfDate: string;
    }>;
    getDetailedAdvancesReceived(organizationGuid?: string, date?: string): Promise<{
        rows: CreditorDetailRow[];
        total: number;
        byAccount: Record<string, number>;
        asOfDate: string;
    }>;
    getFullLiabilitiesReport(organizationGuid?: string, date?: string): Promise<{
        asOfDate: string;
        grandTotal: number;
        sections: {
            sectionName: string;
            accountCodes: string[];
            total: number;
            rows: CreditorDetailRow[];
        }[];
        taxLiabilities: {
            accountCode: string;
            accountName: string;
            balance: number;
        }[];
        otherLiabilities: {
            accountCode: string;
            accountName: string;
            balance: number;
            note: string;
        }[];
        osvSnapshot: {
            accountCode: string;
            accountName: string;
            closingCr: number;
        }[];
    }>;
    getAdvanceSettlementStatus(contractorGuid: string, organizationGuid?: string, dateFrom?: string, dateTo?: string): Promise<{
        contractorName: string;
        accounts: {
            accountCode: string;
            accountName: string;
            totalReceived: number;
            totalOffset: number;
            remainingBalance: number;
            fulfillmentPct: number;
        }[];
        summary: {
            totalReceived: number;
            totalOffset: number;
            remaining: number;
            fulfillmentPct: number;
        };
    }>;
    getSalesWithLines(contractorGuids: string[], dateFrom: string, dateTo: string, organizationGuid?: string): Promise<{
        rows: {
            date: string;
            docNumber: string;
            docGuid: string;
            contractorName: string;
            totalAmount: number;
            lines: {
                item: string;
                qty: number;
                unit: string;
                price: number;
                amount: number;
                vatAmount: number;
            }[];
        }[];
        totals: {
            amount: number;
            vatAmount: number;
            docs: number;
            lines: number;
        };
        byNomenclature: {
            item: string;
            totalQty: number;
            totalAmount: number;
        }[];
    }>;
    getGroupBalance(contractorGuids: string[], groupLabel: string, date?: string): Promise<{
        groupLabel: string;
        asOfDate: string;
        members: {
            guid: string;
            name: string;
        }[];
        accounts: {
            accountCode: string;
            accountName: string;
            balanceDr: number;
            balanceCr: number;
            net: number;
        }[];
        totals: {
            balanceDr: number;
            balanceCr: number;
            net: number;
        };
    }>;
    getSalesReport(dateFrom: string, dateTo: string, contractorGuid?: string, organizationGuid?: string): Promise<{
        rows: {
            date: string;
            docNumber: string;
            contractor: string;
            contract: string;
            currency: string;
            lineType: string;
            item: string;
            qty: number;
            uom: string;
            price: number;
            amount: number;
            vatPct: string;
            vatAmount: number;
            total: number;
            docGuid: string;
        }[];
        totals: {
            amount: number;
            vatAmount: number;
            total: number;
        };
    }>;
    getCashFlowSummary(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<{
        months: {
            month: string;
            inflow: number;
            outflow: number;
            net: number;
        }[];
        totals: {
            inflow: number;
            outflow: number;
            net: number;
        };
        byType: {
            type: string;
            amount: number;
        }[];
    }>;
    getFixedAssets(organizationGuid?: string, date?: string): Promise<{
        asOfDate: string;
        rows: {
            guid: string;
            name: string;
            initialCost: number;
            accumulatedDepreciation: number;
            residualValue: number;
        }[];
        totals: {
            initialCost: number;
            accumulatedDepreciation: number;
            residualValue: number;
        };
    }>;
    getPayrollDocuments(dateFrom: string, dateTo: string, organizationGuid?: string): Promise<{
        docs: {
            docGuid: string;
            date: string;
            number: string;
            period: string;
            totalAmount: number;
            employeeCount: number;
            lines: {
                employeeName: string;
                accrualType: string;
                amount: number;
            }[];
        }[];
        totals: {
            totalAmount: number;
            docs: number;
        };
    }>;
    getStockReport(organizationGuid?: string, dateTo?: string, warehouseGuid?: string, dateFrom?: string): Promise<{
        asOfDate: string;
        procurementWindow: {
            from: string;
            to: string;
        };
        rows: {
            nomenclatureGuid: string;
            nomenclatureName: string;
            articleCode: string;
            accountCode: string;
            unit: string;
            quantity: number;
            totalCostValue: number;
            avgCostPrice: number;
            lastProcurementPrice: number | null;
            lastProcurementDate: string | null;
            lastProcurementDocNumber: string | null;
            lastSupplierGuid: string | null;
            lastSupplierName: string | null;
            warehouses: {
                warehouseGuid: string;
                warehouseName: string;
                quantity: number;
                costValue: number;
            }[];
        }[];
        totals: {
            totalCostValue: number;
            itemCount: number;
            zeroStockItems: number;
        };
    }>;
    getSettlementBreakdown(accountCodes: string[], organizationGuid?: string, date?: string): Promise<{
        rows: SettlementRow[];
        byAccount: Record<string, number>;
    }>;
}
//# sourceMappingURL=ReportsService.d.ts.map