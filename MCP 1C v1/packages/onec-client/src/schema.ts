/**
 * Comprehensive OData schema types for 1C:Бухгалтерия Kazakhstan (agro).
 * Generated from $metadata (4.2 MB) — StandardODATA namespace.
 *
 * Conventions:
 *  - All _Key fields are UUID strings (Edm.Guid)
 *  - Edm.DateTime → ISO string (1C returns "\/Date(ms)\/", client converts to string)
 *  - Edm.Double   → number
 *  - Edm.String   → string
 *  - Edm.Boolean  → boolean
 *  - Optional fields have ? (Nullable="true" in schema)
 *  - NavigationProperty expansions appear as optional nested objects
 */

// ─────────────────────────────────────────────────────────────
// § Branded primitives — prevent accidental id / value mixing
// ─────────────────────────────────────────────────────────────

type Brand<T, B extends string> = T & { readonly __brand: B };

export type Guid      = Brand<string, "Guid">;
export type ISODate   = Brand<string, "ISODate">;
export type AccountCode = Brand<string, "AccountCode">;

export const toGuid = (s: string): Guid => s as Guid;

// ─────────────────────────────────────────────────────────────
// § OData infrastructure
// ─────────────────────────────────────────────────────────────

export interface OneCConfig {
  baseUrl: string;
  username: string;
  password: string;
  timeoutMs: number;
  maxRetries: number;
  /** Max concurrent OData requests in-flight to 1C. Defaults to 8. */
  concurrency?: number;
}

export interface ODataQueryParams {
  filter?: string;
  select?: string;
  expand?: string;
  orderby?: string;
  top?: number;
  skip?: number;
  inlinecount?: boolean;
}

export interface ODataCollection<T> {
  value: T[];
  "odata.count"?: string;
}

// ─────────────────────────────────────────────────────────────
// § Base patterns
// ─────────────────────────────────────────────────────────────

/** Common fields on every catalog (справочник) entity */
export interface CatalogBase {
  Ref_Key: string;
  DataVersion?: string;
  Description?: string;
  Code?: string;
  DeletionMark?: boolean;
  Predefined?: boolean;
  PredefinedDataName?: string;
}

/** Hierarchical catalogs add Parent */
export interface HierarchicalCatalog extends CatalogBase {
  Parent_Key?: string;
  IsFolder?: boolean;
}

/** Common fields on every document */
export interface DocumentBase {
  Ref_Key: string;
  DataVersion?: string;
  Number: string;
  Date: string;
  Posted: boolean;
  DeletionMark?: boolean;
  Организация_Key?: string;
  Контрагент_Key?: string;
  СуммаДокумента?: number;
  Комментарий?: string;
  Ответственный_Key?: string;
}

// ─────────────────────────────────────────────────────────────
// § Catalogs
// ─────────────────────────────────────────────────────────────

export interface Catalog_Номенклатура extends HierarchicalCatalog {
  НаименованиеПолное?: string;
  Артикул?: string;
  Услуга?: boolean;
  БазоваяЕдиницаИзмерения_Key?: string;
  ВидНоменклатуры_Key?: string;
  НоменклатурнаяГруппа_Key?: string;
  СтавкаНДС_Key?: string;
  СтавкаАкциза_Key?: string;
  КодТНВЭД?: string;
  КодКПВЭД?: string;
  ИдентификаторТовараЭСФ?: string;
  НаименованиеНаАнглийскомЯзыке?: string;
  ОсобенностьУчета?: string;
  ВесНетто?: number;
  КоэффициентРасчетаОблагаемойБазыАкциза?: number;
  ВидПодакцизногоТМЗ?: string;
  Описание?: string;
  КодНацКаталога?: string;
  НаименованиеНацКаталог?: string;
  Комментарий?: string;
  // Expanded navigation
  БазоваяЕдиницаИзмерения?: { Ref_Key: string; Description?: string; Code?: string };
  НоменклатурнаяГруппа?: { Ref_Key: string; Description?: string };
}

export interface Catalog_Контрагенты extends HierarchicalCatalog {
  НаименованиеПолное?: string;
  ИдентификационныйКодЛичности?: string;
  КБЕ?: string;
  ЮрФизЛицо?: string;
  НомерСвидетельстваПоНДС?: string;
  ОсновнойДоговорКонтрагента_Key?: string;
  ОсновнойБанковскийСчет_Key?: string;
  ОсновноеКонтактноеЛицо_Key?: string;
  ГоловнойКонтрагент_Key?: string;
  РНН?: string;
  СИК?: string;
  ДатаСвидетельстваПоНДС?: string;
  НомерНалоговойРегистрацииВСтранеРезидентства?: string;
  СтранаРезидентства_Key?: string;
  ФизЛицо_Key?: string;
  КодОрганаГосударственныхДоходов?: string;
  ГосударственноеУчреждение?: boolean;
  ИндивидуальныйПредпринимательАдвокатЧастныйНотариус?: boolean;
  УказыватьРеквизитыГоловнойОрганизацииВСчетеФактуре?: boolean;
  Комментарий?: string;
}

export interface Catalog_Склады extends HierarchicalCatalog {
  Контрагент_Key?: string;
  Префикс?: string;
  Комментарий?: string;
  // Expanded
  Контрагент?: Pick<Catalog_Контрагенты, "Ref_Key" | "Description" | "НаименованиеПолное">;
}

export interface Catalog_ДоговорыКонтрагентов extends CatalogBase {
  Owner_Key?: string;
  Parent_Key?: string;
  IsFolder?: boolean;
  Организация_Key?: string;
  ВалютаВзаиморасчетов_Key?: string;
  ВедениеВзаиморасчетов?: string;
  ВидДоговора?: string;
  НомерДоговора?: string;
  ДатаДоговора?: string;
  ДатаНачалаДействияДоговора?: string;
  ДатаОкончанияДействияДоговора?: string;
  УстановленСрокОплаты?: boolean;
  СрокОплаты?: number;
  УсловияОплаты?: string;
  УсловияПоставки?: string;
  УчетАгентскогоНДС?: boolean;
  ДоговорСовместнойДеятельности?: boolean;
  УчастникСРП?: boolean;
  УникальныйНомерВалютногоКонтроля?: string;
  Комментарий?: string;
}

export interface Catalog_Организации extends CatalogBase {
  НаименованиеПолное?: string;
  ИдентификационныйНомер?: string;
  РНН?: string;
  КБЕ?: string;
  НомерСвидетельстваПоНДС?: string;
  СерияСвидетельстваПоНДС?: string;
  ОсновнойБанковскийСчет_Key?: string;
  ЮрФизЛицо?: string;
  ИностраннаяОрганизация?: boolean;
  Префикс?: string;
  ДатаРегистрации?: string;
}

// ─────────────────────────────────────────────────────────────
// § Chart of accounts
// ─────────────────────────────────────────────────────────────

export interface ChartOfAccounts_Типовой {
  Ref_Key: string;
  DataVersion?: string;
  Code?: string;
  Description?: string;
  Parent_Key?: string;
  DeletionMark?: boolean;
  OffBalance?: boolean;
  Type?: string;
  Валютный?: boolean;
  Количественный?: boolean;
  ЗапретитьИспользоватьВПроводках?: boolean;
  СчетНУ_Key?: string;
  Комментарий?: string;
  /** Субконто dimensions attached to this account */
  ExtDimensionTypes?: Array<{
    ExtDimensionType_Key: string;
    ExtDimensionType?: { Ref_Key: string; Description?: string };
  }>;
}

// ─────────────────────────────────────────────────────────────
// § AccountingRegister_Типовой
// ─────────────────────────────────────────────────────────────

/** Raw journal entry (RecordType) */
export interface AccountingRegisterRecord {
  Recorder: string;
  Recorder_Type: string;
  Period?: string;
  LineNumber: number;
  Active?: boolean;
  AccountDr_Key?: string;
  AccountCr_Key?: string;
  Организация_Key?: string;
  ВалютаDr_Key?: string;
  ВалютаCr_Key?: string;
  СтруктурноеПодразделениеDr_Key?: string;
  СтруктурноеПодразделениеCr_Key?: string;
  Сумма?: number;
  ВалютнаяСуммаDr?: number;
  ВалютнаяСуммаCr?: number;
  КоличествоDr?: number;
  КоличествоCr?: number;
  Содержание?: string;
  НомерЖурнала?: string;
  ВидРегламентнойОперации?: string;
  // Expanded
  AccountDr?: Pick<ChartOfAccounts_Типовой, "Ref_Key" | "Code" | "Description">;
  AccountCr?: Pick<ChartOfAccounts_Типовой, "Ref_Key" | "Code" | "Description">;
}

/**
 * Virtual table row: AccountingRegister_Типовой/Balance
 * One row per unique (Account, Организация, ExtDimension1, ExtDimension2, ...) combination.
 * ExtDimension1/2 contain GUIDs of субконто objects (Номенклатура, Склад, Контрагент, etc.)
 */
export interface AccountingBalance {
  Account_Key?: string;
  Организация_Key?: string;
  СуммаBalance?: number;
  СуммаBalanceDr?: number;
  СуммаBalanceCr?: number;
  КоличествоBalance?: number;
  КоличествоBalanceDr?: number;
  КоличествоBalanceCr?: number;
  ExtDimension1?: string;
  ExtDimension1_Type?: string;
  ExtDimension2?: string;
  ExtDimension2_Type?: string;
  ExtDimension3?: string;
  ExtDimension3_Type?: string;
}

/** Virtual table row: AccountingRegister_Типовой/Turnovers */
export interface AccountingTurnover {
  Account_Key?: string;
  Организация_Key?: string;
  СуммаTurnover?: number;
  СуммаTurnoverDr?: number;
  СуммаTurnoverCr?: number;
  КоличествоTurnover?: number;
  КоличествоTurnoverDr?: number;
  КоличествоTurnoverCr?: number;
}

/** Virtual table row: AccountingRegister_Типовой/BalanceAndTurnovers */
export interface AccountingBalanceAndTurnover {
  Account_Key?: string;
  Организация_Key?: string;
  ExtDimension1?: string;
  ExtDimension1_Type?: string;
  ExtDimension2?: string;
  ExtDimension2_Type?: string;
  ExtDimension3?: string;
  ExtDimension3_Type?: string;
  СуммаOpeningBalanceDr?: number;
  СуммаOpeningBalanceCr?: number;
  СуммаTurnoverDr?: number;
  СуммаTurnoverCr?: number;
  СуммаClosingBalanceDr?: number;
  СуммаClosingBalanceCr?: number;
  КоличествоOpeningBalanceDr?: number;
  КоличествоOpeningBalanceCr?: number;
  КоличествоTurnoverDr?: number;
  КоличествоTurnoverCr?: number;
  КоличествоClosingBalanceDr?: number;
  КоличествоClosingBalanceCr?: number;
}

// ─────────────────────────────────────────────────────────────
// § AccumulationRegister_ТоварыОрганизацийБУ
// ─────────────────────────────────────────────────────────────

/**
 * Raw record: AccumulationRegister_ТоварыОрганизацийБУ
 * NOTE: dimension key is `Товар_Key`, NOT `Номенклатура_Key`
 */
export interface ТоварыОрганизацийБУRecord {
  Recorder: string;
  Recorder_Type: string;
  Period?: string;
  LineNumber: number;
  Active?: boolean;
  RecordType?: string;
  Организация_Key?: string;
  СтруктурноеПодразделение_Key?: string;
  Товар_Key?: string;       // ← the actual field name in this register
  НомерГТД_Key?: string;
  Склад_Key?: string;
  Количество?: number;
  // Expanded
  Товар?: Pick<Catalog_Номенклатура, "Ref_Key" | "Description" | "НаименованиеПолное">;
  Склад?: Pick<Catalog_Склады, "Ref_Key" | "Description">;
}

/** Virtual table row: AccumulationRegister_ТоварыОрганизацийБУ/Balance */
export interface InventoryBalance {
  Организация_Key?: string;
  СтруктурноеПодразделение_Key?: string;
  Товар_Key?: string;       // ← Товар, not Номенклатура
  НомерГТД_Key?: string;
  Склад_Key?: string;
  КоличествоBalance?: number;
  СтоимостьBalance?: number;
  // Expanded
  Товар?: Pick<Catalog_Номенклатура, "Ref_Key" | "Description" | "НаименованиеПолное">;
  Склад?: Pick<Catalog_Склады, "Ref_Key" | "Description">;
}

// ─────────────────────────────────────────────────────────────
// § InformationRegister_КурсыВалют
// ─────────────────────────────────────────────────────────────

export interface ExchangeRate {
  Period: string;
  Валюта_Key: string;
  Курс: number;
  Кратность: number;
  // Expanded
  Валюта?: { Ref_Key: string; Description?: string; Code?: string };
}

// ─────────────────────────────────────────────────────────────
// § AccumulationRegister_ВзаиморасчетыОрганизацийСКонтрагентамиФизЛицами
// ─────────────────────────────────────────────────────────────

export interface ContractorSettlement {
  Контрагент_Key?: string;
  Организация_Key?: string;
  СуммаВзаиморасчетовBalance?: number;
  ПериодВзаиморасчетов?: string;
}

// ─────────────────────────────────────────────────────────────
// § Documents
// ─────────────────────────────────────────────────────────────

/** Line item for РеализацияТоваровУслуг */
export interface РеализацияТоваровУслуг_ТоварRow {
  Ref_Key: string;
  LineNumber: number;
  Номенклатура_Key?: string;
  ЕдиницаИзмерения_Key?: string;
  Количество?: number;
  Цена?: number;
  Сумма?: number;
  СуммаНДС?: number;
  СтавкаНДС_Key?: string;
  СчетУчета_Key?: string;
  Склад_Key?: string;
  // Expanded
  Номенклатура?: Pick<Catalog_Номенклатура, "Ref_Key" | "Description" | "НаименованиеПолное">;
}

/** Document: Реализация товаров и услуг (sales invoice) */
export interface Document_РеализацияТоваровУслуг extends DocumentBase {
  ВалютаДокумента_Key?: string;
  ВидОперации?: string;
  ДоговорКонтрагента_Key?: string;
  Склад_Key?: string;
  СуммаВключаетНДС?: boolean;
  КурсВзаиморасчетов?: number;
  КратностьВзаиморасчетов?: number;
  СчетУчетаРасчетовСКонтрагентом_Key?: string;
  СчетУчетаРасчетовПоАвансам_Key?: string;
  НаличиеОригинала?: boolean;
  ОтложитьНачислениеНДС?: boolean;
  Товары?: РеализацияТоваровУслуг_ТоварRow[];
  // Expanded
  Контрагент?: Pick<Catalog_Контрагенты, "Ref_Key" | "Description" | "НаименованиеПолное" | "ИдентификационныйКодЛичности">;
  ДоговорКонтрагента?: Pick<Catalog_ДоговорыКонтрагентов, "Ref_Key" | "Description" | "НомерДоговора">;
}

/** Line item for ПоступлениеТоваровУслуг */
export interface ПоступлениеТоваровУслуг_ТоварRow {
  Ref_Key: string;
  LineNumber: number;
  Номенклатура_Key?: string;
  ЕдиницаИзмерения_Key?: string;
  Количество?: number;
  Цена?: number;
  Сумма?: number;
  СуммаНДС?: number;
  СтавкаНДС_Key?: string;
  СчетУчета_Key?: string;
  Склад_Key?: string;
  Номенклатура?: Pick<Catalog_Номенклатура, "Ref_Key" | "Description" | "НаименованиеПолное">;
}

/** Document: Поступление товаров и услуг (purchase invoice) */
export interface Document_ПоступлениеТоваровУслуг extends DocumentBase {
  ВалютаДокумента_Key?: string;
  ВидОперации?: string;
  ДоговорКонтрагента_Key?: string;
  Склад_Key?: string;
  СуммаВключаетНДС?: boolean;
  КурсВзаиморасчетов?: number;
  КратностьВзаиморасчетов?: number;
  НаличиеОригинала?: boolean;
  Товары?: ПоступлениеТоваровУслуг_ТоварRow[];
  Контрагент?: Pick<Catalog_Контрагенты, "Ref_Key" | "Description" | "НаименованиеПолное">;
  ДоговорКонтрагента?: Pick<Catalog_ДоговорыКонтрагентов, "Ref_Key" | "Description">;
}

/** Document: Платёжное поручение исходящее (outgoing payment) */
export interface Document_ПлатежноеПоручениеИсходящее extends DocumentBase {
  ВалютаДокумента_Key?: string;
  ВидОперации?: string;
  НазначениеПлатежа?: string;
  СтатьяДвиженияДенежныхСредств_Key?: string;
  СчетОрганизации_Key?: string;
  СчетКонтрагента_Key?: string;
  ДатаВыписки?: string;
  Оплачено?: boolean;
  РНН?: string;
  /** Субконто Дт БУ1/2/3 — hold GUID + _Type partner fields */
  СубконтоДтБУ1?: string;
  СубконтоДтБУ1_Type?: string;
  СубконтоДтБУ2?: string;
  СубконтоДтБУ2_Type?: string;
  СубконтоДтБУ3?: string;
  СубконтоДтБУ3_Type?: string;
  Контрагент?: Pick<Catalog_Контрагенты, "Ref_Key" | "Description" | "НаименованиеПолное">;
}

/** Document: Платёжное поручение входящее (incoming payment) */
export interface Document_ПлатежноеПоручениеВходящее extends DocumentBase {
  ВалютаДокумента_Key?: string;
  ВидОперации?: string;
  НазначениеПлатежа?: string;
  СтатьяДвиженияДенежныхСредств_Key?: string;
  СчетОрганизации_Key?: string;
  СчетКонтрагента_Key?: string;
  ДатаВыписки?: string;
  Оплачено?: boolean;
  НомерВходящегоДокумента?: string;
  ДатаВходящегоДокумента?: string;
  СубконтоКтБУ1?: string;
  СубконтоКтБУ1_Type?: string;
  СубконтоКтБУ2?: string;
  СубконтоКтБУ2_Type?: string;
  Контрагент?: Pick<Catalog_Контрагенты, "Ref_Key" | "Description" | "НаименованиеПолное">;
}

// ─────────────────────────────────────────────────────────────
// § Service-layer output shapes (typed returns for MCP tools)
// ─────────────────────────────────────────────────────────────

export interface AccountBalanceResult {
  accountCode: string;
  accountGuid: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
  quantity: number;
}

export interface AccountTurnoverResult {
  accountCode: string;
  accountGuid: string;
  debitTurnover: number;
  creditTurnover: number;
  netTurnover: number;
}

export interface AccountBreakdownRow {
  dim1: string;
  dim1Name: string;
  dim2: string;
  dim2Name: string;
  qty: number;
  amountDr: number;
  amountCr: number;
}

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

export interface OSVResult {
  rows: OSVRow[];
  totals: {
    openDr: number;
    openCr: number;
    turnDr: number;
    turnCr: number;
    closeDr: number;
    closeCr: number;
  };
}

export interface StockReportRow {
  nomenclatureGuid: string;
  nomenclatureName: string;
  totalQty: number;
  totalCost: number;
  avgCost: number;
  lastPrice?: number;
  lastPriceDate?: string;
  lastSupplierName?: string;
  lastSupplierGuid?: string;
  warehouses: Array<{ warehouseGuid: string; warehouseName: string; qty: number }>;
}

// ─────────────────────────────────────────────────────────────
// § MCP tool input schemas (mirrors Zod schemas in tools/)
// ─────────────────────────────────────────────────────────────

export interface ToolInput_GetOSV {
  dateFrom: string;
  dateTo: string;
  organizationGuid?: string;
}

export interface ToolInput_GetAccountBalance {
  accountCode: string;
  organizationGuid?: string;
  date?: string;
}

export interface ToolInput_GetAccountBreakdown {
  accountCode: string;
  dateTo: string;
  organizationGuid?: string;
}

export interface ToolInput_GetAccountingTurnovers {
  accountCode: string;
  dateFrom: string;
  dateTo: string;
  organizationGuid?: string;
}

export interface ToolInput_SearchContractors {
  query: string;
  top?: number;
}

export interface ToolInput_GetContractorBalance {
  contractorGuid: string;
  organizationGuid?: string;
}

export interface ToolInput_GetPaymentsOut {
  dateFrom: string;
  dateTo: string;
  organizationGuid?: string;
  contractorGuid?: string;
}

export interface ToolInput_GetPaymentsIn {
  dateFrom: string;
  dateTo: string;
  organizationGuid?: string;
  contractorGuid?: string;
}

export interface ToolInput_GetSalesWithLines {
  dateFrom: string;
  dateTo: string;
  organizationGuid?: string;
  contractorGuid?: string;
  top?: number;
}

export interface ToolInput_GetPurchasesReport {
  dateFrom: string;
  dateTo: string;
  organizationGuid?: string;
  contractorGuid?: string;
  top?: number;
}

export interface ToolInput_GetStockReport {
  dateTo?: string;
  organizationGuid?: string;
  warehouseGuid?: string;
  dateFrom?: string;
}

export interface ToolInput_GetExchangeRates {
  currencyCode?: string;
  date?: string;
}

export interface ToolInput_GetFinancialSummary {
  dateFrom: string;
  dateTo: string;
  organizationGuid?: string;
}

// ─────────────────────────────────────────────────────────────
// § Document type registry
// ─────────────────────────────────────────────────────────────

export const DOCUMENT_TYPES = [
  "РеализацияТоваровУслуг",
  "ПоступлениеТоваровУслуг",
  "ПлатежноеПоручениеИсходящее",
  "ПлатежноеПоручениеВходящее",
  "ПриходныйКассовыйОрдер",
  "РасходныйКассовыйОрдер",
  "ПеремещениеТоваров",
  "ТребованиеНакладная",
  "НачислениеЗарплатыРаботникамОрганизаций",
  "ЗакрытиеМесяца",
  "АвансовыйОтчет",
  "ЭСФ",
  "СчетФактураВыданный",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/** Map from DocumentType to its typed header interface */
export interface DocumentTypeMap {
  РеализацияТоваровУслуг: Document_РеализацияТоваровУслуг;
  ПоступлениеТоваровУслуг: Document_ПоступлениеТоваровУслуг;
  ПлатежноеПоручениеИсходящее: Document_ПлатежноеПоручениеИсходящее;
  ПлатежноеПоручениеВходящее: Document_ПлатежноеПоручениеВходящее;
}

// ─────────────────────────────────────────────────────────────
// § Backward-compatible aliases (preserve existing import paths)
// ─────────────────────────────────────────────────────────────

/** @deprecated Use Catalog_Контрагенты */
export type Contractor = Pick<Catalog_Контрагенты,
  "Ref_Key" | "Description" | "НаименованиеПолное" | "РНН" |
  "ИдентификационныйКодЛичности" | "КБЕ" | "ЮрФизЛицо" |
  "НомерСвидетельстваПоНДС" | "ОсновнойДоговорКонтрагента_Key" |
  "ОсновнойБанковскийСчет_Key" | "Parent_Key" | "IsFolder" | "DeletionMark"
>;

/** @deprecated Use Catalog_Номенклатура */
export type Nomenclature = Pick<Catalog_Номенклатура,
  "Ref_Key" | "Description" | "НаименованиеПолное" | "Артикул" |
  "Услуга" | "БазоваяЕдиницаИзмерения_Key" | "СтавкаНДС_Key" |
  "НоменклатурнаяГруппа_Key" | "ИдентификаторТовараЭСФ" | "КодТНВЭД" |
  "Parent_Key" | "IsFolder" | "DeletionMark"
>;

/** @deprecated Use Catalog_Организации */
export type Organization = Pick<Catalog_Организации,
  "Ref_Key" | "Description" | "НаименованиеПолное" |
  "ИдентификационныйНомер" | "РНН" | "НомерСвидетельстваПоНДС" |
  "ОсновнойБанковскийСчет_Key" | "DeletionMark"
>;

/** Legacy alias — field `СтоимостьBalance` still maps to the register, but
 *  note: `Номенклатура_Key` does NOT exist in this register; real field is `Товар_Key` */
export type LegacyInventoryBalance = {
  Номенклатура_Key?: string;  // kept for compatibility; OData actually returns Товар_Key
  Организация_Key?: string;
  КоличествоBalance?: number;
  СтоимостьBalance?: number;
};

/** Base entity shape re-exported for external use */
export interface OneCEntity {
  Ref_Key: string;
  DeletionMark?: boolean;
  Description?: string;
  Code?: string;
  DataVersion?: string;
}

/** Base document shape */
export interface OneCDocument extends OneCEntity {
  Date: string;
  Number: string;
  Posted: boolean;
  Организация_Key?: string;
  Контрагент_Key?: string;
  СуммаДокумента?: number;
}
