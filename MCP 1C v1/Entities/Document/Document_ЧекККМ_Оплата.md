---
category: Document
properties: 9
relations: 1
---

# Document_ЧекККМ_Оплата

**Category:** Document  
**Properties:** 9  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ВидОплаты_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| НомерПлатежнойКарты | Edm.String | true |
| СсылочныйНомер | Edm.String | true |
| НомерЧекаЭТ | Edm.String | true |
| ДанныеПереданыВБанк | Edm.Boolean | true |
| МобильныйПлатеж | Edm.Boolean | true |

## Related Entities

- [[Catalog_ДоговорыЭквайринга]] — ВидОплаты
