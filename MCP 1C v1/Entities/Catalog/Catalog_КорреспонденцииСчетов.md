---
category: Catalog
properties: 15
relations: 2
---

# Catalog_КорреспонденцииСчетов

**Category:** Catalog  
**Properties:** 15  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| Содержание | Edm.String | true |
| СчетДт_Key | Edm.Guid | true |
| СчетКт_Key | Edm.Guid | true |
| ТипДокумента | Edm.String | true |
| ВидОперацииДокумента | Edm.String | true |
| ЗакладкаДокумента | Edm.String | true |
| МоментИспользования | Edm.DateTime | true |
| Меню | Edm.String | true |

## Related Entities

- [[ChartOfAccounts_Типовой]] — СчетДт
- [[ChartOfAccounts_Типовой]] — СчетКт
