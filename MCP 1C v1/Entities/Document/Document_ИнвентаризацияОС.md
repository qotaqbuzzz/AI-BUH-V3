---
category: Document
properties: 21
relations: 6
---

# Document_ИнвентаризацияОС

**Category:** Document  
**Properties:** 21  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| ДатаНачалаИнвентаризации | Edm.DateTime | true |
| ДатаОкончанияИнвентаризации | Edm.DateTime | true |
| ДокументОснованиеВид | Edm.String | true |
| ДокументОснованиеДата | Edm.DateTime | true |
| ДокументОснованиеНомер | Edm.String | true |
| Комментарий | Edm.String | true |
| МОЛОрганизации_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| ПричинаПроведенияИнвентаризации | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ОС | Document_ИнвентаризацияОС_ОС_RowType | true |
| ИнвентаризационнаяКомиссия | Document_ИнвентаризацияОС_ИнвентаризационнаяКомиссия_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ФизическиеЛица]] — МОЛОрганизации
