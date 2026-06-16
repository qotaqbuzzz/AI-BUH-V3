---
category: Catalog
properties: 19
relations: 2
---

# Catalog_КонтактныеЛица

**Category:** Catalog  
**Properties:** 19  
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
| DeletionMark | Edm.Boolean | true |
| Фамилия | Edm.String | true |
| Имя | Edm.String | true |
| Отчество | Edm.String | true |
| ДатаРождения | Edm.DateTime | true |
| Роль_Key | Edm.Guid | true |
| Должность | Edm.String | true |
| Описание | Edm.String | true |
| ОбъектВладелец | Edm.String | true |
| ВидКонтактногоЛица | Edm.String | true |
| ПользовательЛичногоКонтакта_Key | Edm.Guid | true |
| ДополнительныеРеквизиты | Catalog_КонтактныеЛица_ДополнительныеРеквизиты_RowType | true |
| ОбъектВладелец_Type | Edm.String | true |

## Related Entities

- [[Catalog_Пользователи]] — ПользовательЛичногоКонтакта
- [[Catalog_РолиКонтактныхЛиц]] — Роль
