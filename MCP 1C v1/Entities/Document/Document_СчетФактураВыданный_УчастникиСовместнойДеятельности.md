---
category: Document
properties: 4
relations: 1
---

# Document_СчетФактураВыданный_УчастникиСовместнойДеятельности

**Category:** Document  
**Properties:** 4  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| УчастникСовместнойДеятельности_Key | Edm.Guid | true |
| ДоляУчастия | Edm.Double | true |

## Related Entities

- [[Catalog_Контрагенты]] — УчастникСовместнойДеятельности
