---
category: Document
properties: 19
relations: 5
---

# Document_УдержаниеИПНиОПВНУ

**Category:** Document  
**Properties:** 19  
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
| Автор_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| УдержанныйИПН | Document_УдержаниеИПНиОПВНУ_УдержанныйИПН_RowType | true |
| УдержанныйОПВ | Document_УдержаниеИПНиОПВНУ_УдержанныйОПВ_RowType | true |
| УдержанныеВОСМС | Document_УдержаниеИПНиОПВНУ_УдержанныеВОСМС_RowType | true |
| ФизическиеЛица | Document_УдержаниеИПНиОПВНУ_ФизическиеЛица_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
