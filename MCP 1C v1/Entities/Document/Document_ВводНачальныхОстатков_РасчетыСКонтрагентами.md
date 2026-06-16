---
category: Document
properties: 17
relations: 7
---

# Document_ВводНачальныхОстатков_РасчетыСКонтрагентами

**Category:** Document  
**Properties:** 17  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Валюта_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| Документ_Key | Edm.Guid | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| ВалютнаяСумма | Edm.Double | true |
| СуммаБУ | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| Аванс | Edm.Boolean | true |
| СуммаБУКт | Edm.Double | true |
| СуммаНУ | Edm.Double | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СуммаНУКт | Edm.Double | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[Document_ДокументРасчетовСКонтрагентом]] — Документ
