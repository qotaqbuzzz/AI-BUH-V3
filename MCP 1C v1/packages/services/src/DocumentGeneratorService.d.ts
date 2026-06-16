/**
 * Генератор документов по шаблонам из данных 1С.
 * Выводит HTML (пригоден для печати, сохранения в PDF через браузер).
 *
 * Документы:
 *  - Акт сверки взаиморасчётов
 *  - Справка о задолженности
 *  - Реестр кредиторской задолженности
 *  - Уведомление о задолженности
 */
import type { ReportsService } from "./ReportsService.js";
import type { CatalogService } from "./CatalogService.js";
type Brand<T, B extends string> = T & {
    readonly __brand: B;
};
type HtmlContent = Brand<string, "HtmlContent">;
export type DocumentType = "act_sverki" | "debt_certificate" | "creditors_report" | "obligation_notice";
export declare const DOCUMENT_META: {
    readonly act_sverki: {
        readonly type: "act_sverki";
        readonly title: "Reconciliation Act";
        readonly ruTitle: "Акт сверки взаиморасчётов";
        readonly extension: "html";
    };
    readonly debt_certificate: {
        readonly type: "debt_certificate";
        readonly title: "Debt Certificate";
        readonly ruTitle: "Справка о задолженности";
        readonly extension: "html";
    };
    readonly creditors_report: {
        readonly type: "creditors_report";
        readonly title: "Creditors Report";
        readonly ruTitle: "Реестр кредиторской задолженности";
        readonly extension: "html";
    };
    readonly obligation_notice: {
        readonly type: "obligation_notice";
        readonly title: "Obligation Notice";
        readonly ruTitle: "Уведомление о задолженности";
        readonly extension: "html";
    };
};
export interface GeneratedDocument {
    readonly type: DocumentType;
    readonly title: string;
    readonly filename: string;
    readonly html: HtmlContent;
    readonly generatedAt: string;
    readonly params: ActSverkiParams | DebtCertParams | CreditorsReportParams | ObligationNoticeParams;
}
export interface ActSverkiParams {
    readonly contractorGuid: string;
    readonly orgGuid?: string;
    readonly dateFrom: string;
    readonly dateTo: string;
}
export interface DebtCertParams {
    readonly contractorGuid: string;
    readonly orgGuid?: string;
    readonly date?: string;
    readonly certNumber?: string;
}
export interface CreditorsReportParams {
    readonly orgGuid?: string;
    readonly date?: string;
    readonly title?: string;
}
export interface ObligationNoticeParams {
    readonly contractorGuid: string;
    readonly orgGuid?: string;
    readonly date?: string;
    readonly noticeNumber?: string;
    readonly dueDate?: string;
}
export declare class DocumentGeneratorService {
    private readonly reports;
    private readonly catalog;
    constructor(reports: ReportsService, catalog: CatalogService);
    generateActSverki(params: ActSverkiParams): Promise<GeneratedDocument>;
    generateDebtCertificate(params: DebtCertParams): Promise<GeneratedDocument>;
    generateCreditorsReport(params: CreditorsReportParams): Promise<GeneratedDocument>;
    generateObligationNotice(params: ObligationNoticeParams): Promise<GeneratedDocument>;
}
export {};
//# sourceMappingURL=DocumentGeneratorService.d.ts.map