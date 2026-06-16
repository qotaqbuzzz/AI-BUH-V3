---
category: Catalog
properties: 19
relations: 3
---

# Catalog_КартСчета

**Category:** Catalog  
**Properties:** 19  
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
| Owner_Key | Edm.Guid | true |
| Parent_Key | Edm.Guid | true |
| IsFolder | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| Банк_Key | Edm.Guid | true |
| НомерСчета | Edm.String | true |
| НеЯвляетсяВладельцемСчета | Edm.Boolean | true |
| ФизЛицоВладелецСчета_Key | Edm.Guid | true |
| УдалитьФамилия | Edm.String | true |
| УдалитьИмя | Edm.String | true |
| УдалитьОтчество | Edm.String | true |
| УдалитьИдентификационныйКодЛичности | Edm.String | true |
| УдалитьРНН | Edm.String | true |

## Related Entities

- [[Catalog_Банки]] — Банк
- [[Catalog_ФизическиеЛица]] — Owner
- [[Catalog_ФизическиеЛица]] — ФизЛицоВладелецСчета
