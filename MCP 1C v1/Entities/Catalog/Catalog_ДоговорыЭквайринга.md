---
category: Catalog
properties: 12
relations: 3
---

# Catalog_ДоговорыЭквайринга

**Category:** Catalog  
**Properties:** 12  
**Relations:** 3

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
| Эквайрер_Key | Edm.Guid | true |
| ДоговорВзаиморасчетов_Key | Edm.Guid | true |
| ПодключаемоеОборудование_Key | Edm.Guid | true |
| ИспользоватьБезПодключенияОборудования | Edm.Boolean | true |
| ТарифыЗаРасчетноеОбслуживание | Catalog_ДоговорыЭквайринга_ТарифыЗаРасчетноеОбслуживание_RowType | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорВзаиморасчетов
- [[Catalog_Контрагенты]] — Эквайрер
- [[Catalog_ПодключаемоеОборудование]] — ПодключаемоеОборудование
