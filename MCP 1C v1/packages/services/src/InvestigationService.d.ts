/**
 * InvestigationService — раскрывает цепочку платёж → сотрудник → банковский счёт.
 *
 * Инкапсулирует 8-10 запросов в 1С в два метода:
 *   investigatePayment()  — полный анализ одного платёжного документа
 *   findDuplicatePairs()  — найти дубли по дате и вернуть с именами
 */
import type { OneCClient } from "@aibos/onec-client";
export interface PaymentDoc {
    Ref_Key: string;
    Number: string;
    Date: string;
    СуммаДокумента?: number;
    НазначениеПлатежа?: string;
    Комментарий?: string;
    СчетОрганизации_Key?: string;
    Контрагент_Key?: string;
    ТекстПолучателя?: string;
    РННПолучателя?: string;
    Posted?: boolean;
    ПеречислениеЗаработнойПлаты?: ZPRow[];
}
interface ZPRow {
    Ведомость_Key?: string;
    СуммаКВыплате?: number;
}
export interface PaymentInvestigation {
    doc: {
        number: string;
        date: string;
        amount: number;
        purpose: string;
        comment: string;
        posted: boolean;
    };
    orgAccount: {
        guid: string;
        accountNumber: string;
        description: string;
        bank: string;
    };
    recipient: {
        name: string;
        inn: string;
    };
    employee: {
        found: boolean;
        fullName?: string;
        birthDate?: string;
        fizGuid?: string;
        vedNumber?: string;
        vedDate?: string;
        vedPosted?: boolean;
        payAmount?: number;
    };
    verdict: string;
    riskLevel: "high" | "medium" | "low" | "none";
}
export interface DuplicatePair {
    docA: string;
    docB: string;
    date: string;
    amount: number;
    contractorName: string;
    purposeA: string;
    purposeB: string;
    sameAccount: boolean;
    sameEmployee: boolean;
    employeeName?: string;
    riskLevel: "high" | "medium";
    recommendation: string;
}
export declare class InvestigationService {
    private readonly client;
    constructor(client: OneCClient);
    investigatePayment(docNumber: string, docDate: string, // YYYY-MM-DD
    orgGuid: string): Promise<PaymentInvestigation>;
    findDuplicatePairs(orgGuid: string, dateFrom: string, dateTo: string, windowHours?: number): Promise<DuplicatePair[]>;
    private resolveOrgAccount;
    private resolveContractor;
    private resolveEmployee;
    private buildVerdict;
    private calcRisk;
    private notFound;
    private batchNames;
}
export {};
//# sourceMappingURL=InvestigationService.d.ts.map