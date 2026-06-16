---
category: Document
properties: 6
relations: 1
---

# Document_РасчетНалоговПриПоступленииАктивовУслуг_ИсчисленныйСН

**Category:** Document  
**Properties:** 6  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| Налог | Edm.Double | true |
| МесяцНалоговогоПериода | Edm.DateTime | true |
| ОблагаемаяБаза | Edm.Double | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
