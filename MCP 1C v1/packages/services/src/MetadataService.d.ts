import type { OneCClient } from "@aibos/onec-client";
interface MetadataEntity {
    name: string;
    type: string;
}
type EntityTypeFilter = "Catalog" | "Document" | "Register" | "all";
export declare class MetadataService {
    private readonly client;
    private cache;
    constructor(client: OneCClient);
    private loadEntities;
    getEntities(filter?: EntityTypeFilter): Promise<MetadataEntity[]>;
}
export {};
//# sourceMappingURL=MetadataService.d.ts.map