---
category: Document
properties: 6
relations: 3
---

# Document_ТребованиеНакладная_МатериалыЗаказчика

**Category:** Document  
**Properties:** 6  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Счет_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| СчетПередачи_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Номенклатура]] — Номенклатура
- [[ChartOfAccounts_Типовой]] — Счет
- [[ChartOfAccounts_Типовой]] — СчетПередачи
