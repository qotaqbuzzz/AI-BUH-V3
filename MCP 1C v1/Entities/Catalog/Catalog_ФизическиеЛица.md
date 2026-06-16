---
category: Catalog
properties: 20
relations: 1
---

# Catalog_ФизическиеЛица

**Category:** Catalog  
**Properties:** 20  
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
| ДатаРождения | Edm.DateTime | true |
| РНН | Edm.String | true |
| СИК | Edm.String | true |
| Комментарий | Edm.String | true |
| Пол | Edm.String | true |
| МестоРождения | Edm.String | true |
| ИдентификационныйКодЛичности | Edm.String | true |
| ГруппаДоступа_Key | Edm.Guid | true |
| НаименованиеНаАнглийскомЯзыке | Edm.String | true |
| ФайлПодписи_Key | Edm.Guid | true |
| ДополнительныеРеквизиты | Catalog_ФизическиеЛица_ДополнительныеРеквизиты_RowType | true |

## Related Entities

- [[Catalog_ФизическиеЛицаПрисоединенныеФайлы]] — ФайлПодписи
