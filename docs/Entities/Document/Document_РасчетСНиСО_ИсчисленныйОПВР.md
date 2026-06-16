---
category: Document
properties: 6
relations: 1
---

# Document_РасчетСНиСО_ИсчисленныйОПВР

**Category:** Document  
**Properties:** 6  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| Взнос | Edm.Double | true |
| МесяцНалоговогоПериода | Edm.DateTime | true |
| ОблагаемаяБаза | Edm.Double | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
