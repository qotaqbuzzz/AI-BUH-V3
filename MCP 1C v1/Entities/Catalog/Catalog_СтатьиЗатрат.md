---
category: Catalog
properties: 14
relations: 1
---

# Catalog_СтатьиЗатрат

**Category:** Catalog  
**Properties:** 14  
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
| ПринятиеКНалоговомуУчету | Edm.Boolean | true |
| КатегорияЗатрат | Edm.String | true |
| ВидРасходовНУ_Key | Edm.Guid | true |
| НаименованиеНаАнглийскомЯзыке | Edm.String | true |
| ДополнительныеРеквизиты | Catalog_СтатьиЗатрат_ДополнительныеРеквизиты_RowType | true |

## Related Entities

- [[Catalog_ВидыРасходовНУ]] — ВидРасходовНУ
