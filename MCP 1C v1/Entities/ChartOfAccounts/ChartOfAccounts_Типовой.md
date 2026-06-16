---
category: ChartOfAccounts
properties: 17
relations: 1
---

# ChartOfAccounts_Типовой

**Category:** ChartOfAccounts  
**Properties:** 17  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Parent_Key | Edm.Guid | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| Order | Edm.String | true |
| OffBalance | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| Type | Edm.String | true |
| ЗапретитьИспользоватьВПроводках | Edm.Boolean | true |
| СчетНУ_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Валютный | Edm.Boolean | true |
| Количественный | Edm.Boolean | true |
| ExtDimensionTypes | ChartOfAccounts_Типовой_ExtDimensionTypes | true |

## Related Entities

- [[ChartOfAccounts_Налоговый]] — СчетНУ
