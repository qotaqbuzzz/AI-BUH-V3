---
category: Document
properties: 13
relations: 7
---

# Document_ВводНачальныхОстатков_Запасы

**Category:** Document  
**Properties:** 13  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетУчетаБУ_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| Склад_Key | Edm.Guid | true |
| Партия_Key | Edm.Guid | true |
| КоличествоБУ | Edm.Double | true |
| СуммаБУ | Edm.Double | true |
| Контрагент_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| КоличествоНУ | Edm.Double | true |
| СуммаНУ | Edm.Double | true |
| ВидУчетаНУ_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_Склады]] — Склад
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[Document_Партия]] — Партия
