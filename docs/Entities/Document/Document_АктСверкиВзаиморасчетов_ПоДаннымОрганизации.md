---
category: Document
properties: 8
relations: 1
---

# Document_АктСверкиВзаиморасчетов_ПоДаннымОрганизации

**Category:** Document  
**Properties:** 8  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Дата | Edm.DateTime | true |
| Документ | Edm.String | true |
| Дебет | Edm.Double | true |
| Кредит | Edm.Double | true |
| Договор_Key | Edm.Guid | true |
| Документ_Type | Edm.String | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — Договор
