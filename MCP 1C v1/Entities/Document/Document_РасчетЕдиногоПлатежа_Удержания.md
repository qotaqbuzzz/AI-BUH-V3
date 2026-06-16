---
category: Document
properties: 7
relations: 3
---

# Document_РасчетЕдиногоПлатежа_Удержания

**Category:** Document  
**Properties:** 7  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| ВидРасчета_Key | Edm.Guid | true |
| Размер | Edm.Double | true |
| ДокументОснование_Key | Edm.Guid | true |
| Результат | Edm.Double | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[ChartOfCalculationTypes_УдержанияОрганизаций]] — ВидРасчета
- [[Document_ИсполнительныйЛист]] — ДокументОснование
