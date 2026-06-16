---
category: Document
properties: 8
relations: 1
---

# Document_РасчетНалоговПриПоступленииАктивовУслуг_ВычетыИПН

**Category:** Document  
**Properties:** 8  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо | Edm.String | true |
| ВидВычета_Key | Edm.Guid | true |
| РазрешенныйВычет | Edm.Double | true |
| ПримененныйВычет | Edm.Double | true |
| МесяцНалоговогоПериода | Edm.DateTime | true |
| ФизЛицо_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВычетыИПН]] — ВидВычета
