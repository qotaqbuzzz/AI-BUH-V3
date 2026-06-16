export interface AccountGroup {
    code: string;
    name: string;
    description: string;
}
export interface AccountSubsection {
    code: string;
    name: string;
    description: string;
    groups: AccountGroup[];
}
export interface AccountSection {
    code: string;
    name: string;
    description: string;
    subsections: AccountSubsection[];
}
interface ChartData {
    meta: {
        title: string;
        source: string;
    };
    sections: AccountSection[];
}
export type AccountLookupResult = {
    level: "section";
    breadcrumb: "";
    data: Omit<AccountSection, "subsections"> & {
        subsections: Array<{
            code: string;
            name: string;
            group_count: number;
        }>;
    };
} | {
    level: "subsection";
    breadcrumb: string;
    data: AccountSubsection;
} | {
    level: "group";
    breadcrumb: string;
    data: AccountGroup;
} | null;
export interface AccountSearchResult {
    level: "section" | "subsection" | "group";
    code: string;
    name: string;
    description: string;
    breadcrumb: string;
}
export declare class AccountsService {
    private readonly chart;
    private readonly sectionIdx;
    private readonly subsectionIdx;
    private readonly groupIdx;
    constructor();
    private buildIndex;
    getMeta(): {
        title: string;
        source: string;
    };
    listSections(): Array<{
        code: string;
        name: string;
        description: string;
        subsection_count: number;
    }>;
    getSection(code: string): (Omit<AccountSection, "subsections"> & {
        subsections: Array<{
            code: string;
            name: string;
            group_count: number;
        }>;
    }) | null;
    getSubsection(code: string): ({
        breadcrumb: string;
    } & AccountSubsection) | null;
    lookupCode(code: string): AccountLookupResult;
    search(query: string, limit: number): {
        total_found: number;
        showing: number;
        results: AccountSearchResult[];
    };
    getFullChart(): ChartData;
}
export {};
//# sourceMappingURL=AccountsService.d.ts.map