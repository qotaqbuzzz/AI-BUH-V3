---
category: Catalog
properties: 12
relations: 1
---

# Catalog_СпецификацииНоменклатуры

**Category:** Catalog  
**Properties:** 12  
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
| Owner_Key | Edm.Guid | true |
| Parent_Key | Edm.Guid | true |
| IsFolder | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| Количество | Edm.Double | true |
| ИсходныеКомплектующие | Catalog_СпецификацииНоменклатуры_ИсходныеКомплектующие_RowType | true |

## Related Entities

- [[Catalog_Номенклатура]] — Owner
