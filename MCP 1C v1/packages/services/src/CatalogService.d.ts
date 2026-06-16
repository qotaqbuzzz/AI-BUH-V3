import type { OneCClient } from "@aibos/onec-client";
import type { Contractor, Nomenclature, Organization } from "@aibos/onec-client";
export declare class CatalogService {
    private readonly client;
    constructor(client: OneCClient);
    searchContractors(query: string, limit?: number): Promise<Contractor[]>;
    getContractor(guid: string): Promise<Contractor>;
    searchNomenclature(query: string, isService?: boolean, limit?: number): Promise<Nomenclature[]>;
    getOrganizations(): Promise<Organization[]>;
    getWarehouses(): Promise<{
        guid: string;
        name: string;
        code: string;
    }[]>;
    getContractorContracts(contractorGuid: string): Promise<{
        guid: string;
        name: string;
        contractType: string;
        currency: string;
        amount: number;
        startDate: string | null;
        endDate: string | null;
    }[]>;
}
//# sourceMappingURL=CatalogService.d.ts.map