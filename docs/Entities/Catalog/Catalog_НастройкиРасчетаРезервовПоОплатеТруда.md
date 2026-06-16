---
category: Catalog
properties: 15
relations: 2
---

# Catalog_НастройкиРасчетаРезервовПоОплатеТруда

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
| DeletionMark | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Резерв_Key | Edm.Guid | true |
| ВидРезерва | Edm.String | true |
| НачалоПериода | Edm.DateTime | true |
| КонецПериода | Edm.DateTime | true |
| ПолноеНаименование | Edm.String | true |
| ФормироватьРезервНУ | Edm.Boolean | true |
| НормативОтчисленийВРезерв | Edm.Double | true |
| ПредельнаяВеличинаОтчисленийВРезервНУ | Edm.Double | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_Резервы]] — Резерв
