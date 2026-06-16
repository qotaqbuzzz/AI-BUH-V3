---
category: Catalog
properties: 11
relations: 1
---

# Catalog_Резервы

**Category:** Catalog  
**Properties:** 11  
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
| ВидРезерва | Edm.String | true |
| СтатьяЗатрат_Key | Edm.Guid | true |
| ПринятиеКВычетуПоНалоговомуУчету | Edm.Boolean | true |
| БазовыеВидыРасчета | Catalog_Резервы_БазовыеВидыРасчета_RowType | true |

## Related Entities

- [[Catalog_СтатьиЗатрат]] — СтатьяЗатрат
