---
category: Catalog
properties: 23
relations: 3
---

# Catalog_Пользователи

**Category:** Catalog  
**Properties:** 23  
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
| Недействителен | Edm.Boolean | true |
| Подразделение_Key | Edm.Guid | true |
| ФизическоеЛицо_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Служебный | Edm.Boolean | true |
| Подготовлен | Edm.Boolean | true |
| ИдентификаторПользователяИБ | Edm.Guid | true |
| ФизЛицо_Key | Edm.Guid | true |
| ИдентификаторПользователяСервиса | Edm.Guid | true |
| УдалитьСвойстваПользователяИБ_Base64Data | Edm.Binary | true |
| Фотография_Base64Data | Edm.Binary | true |
| ДополнительныеРеквизиты | Catalog_Пользователи_ДополнительныеРеквизиты_RowType | true |
| УдалитьСвойстваПользователяИБ_Type | Edm.String | true |
| Фотография_Type | Edm.String | true |
| УдалитьСвойстваПользователяИБ | Edm.Stream | true |
| Фотография | Edm.Stream | true |

## Related Entities

- [[Catalog_ПодразделенияОрганизаций]] — Подразделение
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[Catalog_ФизическиеЛица]] — ФизическоеЛицо
