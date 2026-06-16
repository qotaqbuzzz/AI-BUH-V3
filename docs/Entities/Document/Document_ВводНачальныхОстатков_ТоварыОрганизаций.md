---
category: Document
properties: 6
relations: 3
---

# Document_ВводНачальныхОстатков_ТоварыОрганизаций

**Category:** Document  
**Properties:** 6  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Склад_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_Склады]] — Склад
