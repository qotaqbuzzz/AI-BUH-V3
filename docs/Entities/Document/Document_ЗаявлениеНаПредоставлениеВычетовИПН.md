---
category: Document
properties: 17
relations: 5
---

# Document_ЗаявлениеНаПредоставлениеВычетовИПН

**Category:** Document  
**Properties:** 17  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Сотрудник_Key | Edm.Guid | true |
| Месяц | Edm.DateTime | true |
| МесяцЗавершения | Edm.DateTime | true |
| Ответственный_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Автор_Key | Edm.Guid | true |
| НаличиеЗаявления | Edm.Boolean | true |
| Вычеты | Document_ЗаявлениеНаПредоставлениеВычетовИПН_Вычеты_RowType | true |
| ПрочиеВычеты | Document_ЗаявлениеНаПредоставлениеВычетовИПН_ПрочиеВычеты_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ФизическиеЛица]] — Сотрудник
