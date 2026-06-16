---
category: Document
properties: 7
relations: 2
---

# Document_ПередачаТоваров_НомераГТД

**Category:** Document  
**Properties:** 7  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| КлючСвязи | Edm.Int64 | true |
| Номенклатура_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |
| Коэффициент | Edm.Double | true |
| Количество | Edm.Double | true |

## Related Entities

- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
