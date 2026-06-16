---
category: Document
properties: 10
relations: 5
---

# Document_ВводНачальныхОстатков_РасчетыСПодотчетнымиЛицами

**Category:** Document  
**Properties:** 10  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетУчетаБУ_Key | Edm.Guid | true |
| РаботникОрганизации_Key | Edm.Guid | true |
| СуммаБУ | Edm.Double | true |
| Валюта_Key | Edm.Guid | true |
| ВалютнаяСумма | Edm.Double | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СуммаНУ | Edm.Double | true |
| ВидУчетаНУ_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ФизическиеЛица]] — РаботникОрганизации
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
