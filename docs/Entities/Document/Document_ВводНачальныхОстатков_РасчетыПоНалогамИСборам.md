---
category: Document
properties: 10
relations: 5
---

# Document_ВводНачальныхОстатков_РасчетыПоНалогамИСборам

**Category:** Document  
**Properties:** 10  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетУчетаБУ_Key | Edm.Guid | true |
| ВидНалога_Key | Edm.Guid | true |
| ВидПлатежаВБюджет | Edm.String | true |
| СуммаБУ | Edm.Double | true |
| НалоговыйКомитет_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СуммаНУ | Edm.Double | true |
| ВидУчетаНУ_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Контрагенты]] — НалоговыйКомитет
- [[Catalog_НалогиСборыОтчисления]] — ВидНалога
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
