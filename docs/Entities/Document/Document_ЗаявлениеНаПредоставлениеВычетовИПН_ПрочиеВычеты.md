---
category: Document
properties: 6
relations: 1
---

# Document_ЗаявлениеНаПредоставлениеВычетовИПН_ПрочиеВычеты

**Category:** Document  
**Properties:** 6  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ВидВычетаИПН_Key | Edm.Guid | true |
| Размер | Edm.Double | true |
| ДействуетПо | Edm.DateTime | true |
| ДействуетС | Edm.DateTime | true |

## Related Entities

- [[Catalog_ВычетыИПН]] — ВидВычетаИПН
