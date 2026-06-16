---
category: Catalog
properties: 13
relations: 1
---

# Catalog_МаршрутыПодписания

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
| Parent_Key | Edm.Guid | true |
| IsFolder | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| СхемаПодписания | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| КлючАвтоматическойНастройки | Edm.String | true |
| ТаблицаТребований | Catalog_МаршрутыПодписания_ТаблицаТребований_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
