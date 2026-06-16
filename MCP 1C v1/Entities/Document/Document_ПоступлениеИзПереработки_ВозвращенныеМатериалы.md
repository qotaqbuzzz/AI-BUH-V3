---
category: Document
properties: 9
relations: 6
---

# Document_ПоступлениеИзПереработки_ВозвращенныеМатериалы

**Category:** Document  
**Properties:** 9  
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
| НомерГТД_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[ChartOfAccounts_Налоговый]] — СчетПередачиНУ
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетПередачиБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
