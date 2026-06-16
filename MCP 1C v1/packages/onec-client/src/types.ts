/**
 * types.ts — re-exports the canonical schema and keeps backward-compatible
 * names that existing service/tool code depends on.
 *
 * New code: import from "@aibos/onec-client" and use the Catalog_* / Document_*
 * names defined in schema.ts.
 */

export type {
  // Infrastructure
  OneCConfig,
  ODataQueryParams,
  ODataCollection,
  OneCEntity,
  OneCDocument,

  // Branded primitives
  Guid,
  ISODate,
  AccountCode,

  // Catalogs
  CatalogBase,
  HierarchicalCatalog,
  DocumentBase,
  Catalog_Номенклатура,
  Catalog_Контрагенты,
  Catalog_Склады,
  Catalog_ДоговорыКонтрагентов,
  Catalog_Организации,

  // Chart of accounts
  ChartOfAccounts_Типовой,

  // AccountingRegister_Типовой
  AccountingRegisterRecord,
  AccountingBalance,
  AccountingTurnover,
  AccountingBalanceAndTurnover,

  // AccumulationRegisters
  ТоварыОрганизацийБУRecord,
  InventoryBalance,
  LegacyInventoryBalance,

  // InformationRegisters
  ExchangeRate,
  ContractorSettlement,

  // Documents
  РеализацияТоваровУслуг_ТоварRow,
  Document_РеализацияТоваровУслуг,
  ПоступлениеТоваровУслуг_ТоварRow,
  Document_ПоступлениеТоваровУслуг,
  Document_ПлатежноеПоручениеИсходящее,
  Document_ПлатежноеПоручениеВходящее,

  // Service output shapes
  AccountBalanceResult,
  AccountTurnoverResult,
  AccountBreakdownRow,
  OSVRow,
  OSVResult,
  StockReportRow,

  // MCP tool input shapes
  ToolInput_GetOSV,
  ToolInput_GetAccountBalance,
  ToolInput_GetAccountBreakdown,
  ToolInput_GetAccountingTurnovers,
  ToolInput_SearchContractors,
  ToolInput_GetContractorBalance,
  ToolInput_GetPaymentsOut,
  ToolInput_GetPaymentsIn,
  ToolInput_GetSalesWithLines,
  ToolInput_GetPurchasesReport,
  ToolInput_GetStockReport,
  ToolInput_GetExchangeRates,
  ToolInput_GetFinancialSummary,

  // Document type map
  DocumentTypeMap,

  // Backward-compat aliases
  Contractor,
  Nomenclature,
  Organization,
} from "./schema.js";

export { DOCUMENT_TYPES, toGuid } from "./schema.js";
export type { DocumentType } from "./schema.js";
