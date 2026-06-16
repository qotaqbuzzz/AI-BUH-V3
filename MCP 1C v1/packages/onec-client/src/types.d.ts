/**
 * types.ts — re-exports the canonical schema and keeps backward-compatible
 * names that existing service/tool code depends on.
 *
 * New code: import from "@aibos/onec-client" and use the Catalog_* / Document_*
 * names defined in schema.ts.
 */
export type { OneCConfig, ODataQueryParams, ODataCollection, OneCEntity, OneCDocument, Guid, ISODate, AccountCode, CatalogBase, HierarchicalCatalog, DocumentBase, Catalog_Номенклатура, Catalog_Контрагенты, Catalog_Склады, Catalog_ДоговорыКонтрагентов, Catalog_Организации, ChartOfAccounts_Типовой, AccountingRegisterRecord, AccountingBalance, AccountingTurnover, AccountingBalanceAndTurnover, ТоварыОрганизацийБУRecord, InventoryBalance, LegacyInventoryBalance, ExchangeRate, ContractorSettlement, РеализацияТоваровУслуг_ТоварRow, Document_РеализацияТоваровУслуг, ПоступлениеТоваровУслуг_ТоварRow, Document_ПоступлениеТоваровУслуг, Document_ПлатежноеПоручениеИсходящее, Document_ПлатежноеПоручениеВходящее, AccountBalanceResult, AccountTurnoverResult, AccountBreakdownRow, OSVRow, OSVResult, StockReportRow, ToolInput_GetOSV, ToolInput_GetAccountBalance, ToolInput_GetAccountBreakdown, ToolInput_GetAccountingTurnovers, ToolInput_SearchContractors, ToolInput_GetContractorBalance, ToolInput_GetPaymentsOut, ToolInput_GetPaymentsIn, ToolInput_GetSalesWithLines, ToolInput_GetPurchasesReport, ToolInput_GetStockReport, ToolInput_GetExchangeRates, ToolInput_GetFinancialSummary, DocumentTypeMap, Contractor, Nomenclature, Organization, } from "./schema.js";
export { DOCUMENT_TYPES, toGuid } from "./schema.js";
export type { DocumentType } from "./schema.js";
//# sourceMappingURL=types.d.ts.map