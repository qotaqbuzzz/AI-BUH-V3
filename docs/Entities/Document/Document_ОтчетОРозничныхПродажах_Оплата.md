---
category: Document
properties: 4
relations: 1
---

# Document_ОтчетОРозничныхПродажах_Оплата

**Category:** Document  
**Properties:** 4  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ВидОплаты_Key | Edm.Guid | true |
| СуммаОплаты | Edm.Double | true |

## Related Entities

- [[Catalog_ДоговорыЭквайринга]] — ВидОплаты
