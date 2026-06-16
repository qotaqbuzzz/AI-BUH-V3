---
category: Catalog
properties: 17
relations: 2
---

# Catalog_ГруппыДоступа

**Category:** Catalog  
**Properties:** 17  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Parent_Key | Edm.Guid | true |
| IsFolder | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| Профиль_Key | Edm.Guid | true |
| Пользователь | Edm.String | true |
| Комментарий | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| ОсновнаяГруппаДоступаПоставляемогоПрофиля | Edm.Boolean | true |
| Пользователи | Catalog_ГруппыДоступа_Пользователи_RowType | true |
| ВидыДоступа | Catalog_ГруппыДоступа_ВидыДоступа_RowType | true |
| ЗначенияДоступа | Catalog_ГруппыДоступа_ЗначенияДоступа_RowType | true |
| Пользователь_Type | Edm.String | true |

## Related Entities

- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ПрофилиГруппДоступа]] — Профиль
