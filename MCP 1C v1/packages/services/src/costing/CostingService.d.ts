import type { OneCClient } from "@aibos/onec-client";
import type { RegisterService } from "../RegisterService.js";
export interface NomenclatureUnitCostResult {
    nomenclatureGuid: string;
    nomenclatureName: string;
    unit: string;
    period: {
        from: string;
        to: string;
    };
    production: {
        qty: number;
        cost: number;
        unitCost: number;
    };
    cogs: {
        qty: number;
        cost: number;
        unitCost: number;
    };
    inventory: {
        openingQty: number;
        openingCost: number;
        closingQty: number;
        closingCost: number;
        avgCostAtClose: number;
    };
    note: string;
}
export interface COGSCompositionSource {
    corrAccountCode: string;
    accountName: string;
    category: string;
    totalAmount: number;
    pctOfTotal: number;
    sampleDocuments: {
        guid: string;
        number: string;
        date: string;
        type: string;
        contractor?: string;
    }[];
}
export interface COGSCompositionResult {
    period: {
        from: string;
        to: string;
    };
    organizationGuid?: string;
    sources: COGSCompositionSource[];
    total: number;
    note: string;
}
export interface CostItemEntry {
    costItemGuid: string;
    costItemName: string;
    amount: number;
    pctOfTotal: number;
}
export interface HarvestEntry {
    productGroupGuid: string;
    productGroupName: string;
    amount: number;
    pctOfTotal: number;
}
export interface RealProductionCostsResult {
    period: {
        from: string;
        to: string;
    };
    productionAccount: string;
    wipAccount: string;
    finishedGoodsAccount: string;
    realCosts: {
        total: number;
        byCostItem: CostItemEntry[];
    };
    wipPingPong: {
        reOpening: number;
        closingToWip: number;
    };
    harvestCapitalized: {
        total: number;
        byProduct: HarvestEntry[];
    };
    crossCheck: {
        realCosts: number;
        harvestCapitalized: number;
        wipNetIncrease: number;
        note: string;
    };
    totalRawDebitTurnover: number;
    note: string;
}
export declare class CostingService {
    private readonly client;
    private readonly register;
    constructor(client: OneCClient, register: RegisterService);
    getNomenclatureUnitCost(nomenclatureGuid: string, dateFrom: string, dateTo: string, organizationGuid?: string): Promise<NomenclatureUnitCostResult>;
    getCOGSCompositionWithDocs(dateFrom: string, dateTo: string, organizationGuid?: string, perCategoryDocLimit?: number): Promise<COGSCompositionResult>;
    private resolveCatalogNames;
    getRealProductionCosts(dateFrom: string, dateTo: string, organizationGuid?: string, productionAccountCode?: string, wipAccountCode?: string, finishedGoodsAccountCode?: string): Promise<RealProductionCostsResult>;
    private resolveNomenclatureDetails;
    private resolveRecorderDocs;
}
//# sourceMappingURL=CostingService.d.ts.map