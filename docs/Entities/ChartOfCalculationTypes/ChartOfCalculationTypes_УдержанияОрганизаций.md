---
category: ChartOfCalculationTypes
properties: 15
relations: 1
---

# ChartOfCalculationTypes_УдержанияОрганизаций

**Category:** ChartOfCalculationTypes  
**Properties:** 15  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| DataVersion | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| СпособРасчета | Edm.String | true |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |
| ВычитатьИзБазыИПН | Edm.Boolean | true |
| ВычитатьИзБазыОПВ | Edm.Boolean | true |
| ОбъединятьВРасчетномЛистке | Edm.Boolean | true |
| ВычитатьИзБазыВОСМС | Edm.Boolean | true |
| LeadingCalculationTypes | ChartOfCalculationTypes_УдержанияОрганизаций_LeadingCalculationTypes | true |
| BaseCalculationTypes | ChartOfCalculationTypes_УдержанияОрганизаций_BaseCalculationTypes | true |

## Related Entities

- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
