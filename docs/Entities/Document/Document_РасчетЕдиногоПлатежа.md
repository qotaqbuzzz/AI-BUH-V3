---
category: Document
properties: 18
relations: 5
---

# Document_РасчетЕдиногоПлатежа

**Category:** Document  
**Properties:** 18  
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
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| Автор_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| КраткийСоставДокумента | Edm.String | true |
| ИсчисленныйЕП | Document_РасчетЕдиногоПлатежа_ИсчисленныйЕП_RowType | true |
| Удержания | Document_РасчетЕдиногоПлатежа_Удержания_RowType | true |
| ФизическиеЛица | Document_РасчетЕдиногоПлатежа_ФизическиеЛица_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
