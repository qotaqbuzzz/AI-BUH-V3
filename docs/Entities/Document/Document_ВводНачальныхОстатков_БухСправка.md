---
category: Document
properties: 21
relations: 4
---

# Document_ВводНачальныхОстатков_БухСправка

**Category:** Document  
**Properties:** 21  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетУчетаБУ_Key | Edm.Guid | true |
| Субконто1 | Edm.String | true |
| Субконто2 | Edm.String | true |
| Субконто3 | Edm.String | true |
| КоличествоБУ | Edm.Double | true |
| СуммаБУ | Edm.Double | true |
| Валюта_Key | Edm.Guid | true |
| ВалютнаяСумма | Edm.Double | true |
| СуммаБУКт | Edm.Double | true |
| КоличествоНУ | Edm.Double | true |
| СуммаНУ | Edm.Double | true |
| СуммаНУКт | Edm.Double | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| КоличествоБУКт | Edm.Double | true |
| КоличествоНУКт | Edm.Double | true |
| Субконто1_Type | Edm.String | true |
| Субконто2_Type | Edm.String | true |
| Субконто3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
