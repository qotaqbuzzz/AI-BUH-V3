---
category: Document
properties: 5
relations: 2
---

# Document_РеализацияУслугПоПереработке_МатериалыЗаказчика

**Category:** Document  
**Properties:** 5  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| СчетУчета_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Номенклатура]] — Номенклатура
- [[ChartOfAccounts_Типовой]] — СчетУчета
