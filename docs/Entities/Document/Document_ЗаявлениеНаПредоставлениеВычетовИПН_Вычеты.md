---
category: Document
properties: 5
relations: 1
---

# Document_ЗаявлениеНаПредоставлениеВычетовИПН_Вычеты

**Category:** Document  
**Properties:** 5  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ВидВычетаИПН_Key | Edm.Guid | true |
| ПредоставлятьВычет | Edm.Boolean | true |
| Основание | Edm.String | true |

## Related Entities

- [[Catalog_ВычетыИПН]] — ВидВычетаИПН
