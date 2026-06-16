---
category: Catalog
properties: 13
relations: 1
---

# Catalog_ТипыЦенНоменклатуры

**Category:** Catalog  
**Properties:** 13  
**Relations:** 1

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
| ВалютаЦены_Key | Edm.Guid | true |
| ЦенаВключаетНДС | Edm.Boolean | true |
| ЦенаВключаетАкциз | Edm.Boolean | true |
| ПорядокОкругления | Edm.String | true |
| ОкруглятьВБольшуюСторону | Edm.Boolean | true |
| Комментарий | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаЦены
