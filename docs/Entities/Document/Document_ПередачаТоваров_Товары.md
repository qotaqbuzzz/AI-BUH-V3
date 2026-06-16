---
category: Document
properties: 10
relations: 6
---

# Document_ПередачаТоваров_Товары

**Category:** Document  
**Properties:** 10  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетПередачиБУ_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СчетПередачиНУ_Key | Edm.Guid | true |
| КлючСвязи | Edm.Int64 | true |
| ДоговорЗакупа_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_Номенклатура]] — Номенклатура
- [[ChartOfAccounts_Налоговый]] — СчетПередачиНУ
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетПередачиБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
