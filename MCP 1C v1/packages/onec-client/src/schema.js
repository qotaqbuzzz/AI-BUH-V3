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
export const toGuid = (s) => s;
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
];
//# sourceMappingURL=schema.js.map