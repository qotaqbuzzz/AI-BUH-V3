---
category: Catalog
properties: 10
relations: 2
---

# Catalog_Кассы

**Category:** Catalog  
**Properties:** 10  
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
| Owner_Key | Edm.Guid | true |
| DeletionMark | Edm.Boolean | true |
| ВалютаДенежныхСредств_Key | Edm.Guid | true |
| Префикс | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДенежныхСредств
- [[Catalog_Организации]] — Owner
