---
category: Document
properties: 20
relations: 6
---

# Document_ПеремещениеОС

**Category:** Document  
**Properties:** 20  
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
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СобытиеОС_Key | Edm.Guid | true |
| НачальноеЗаполнениеАналитикиНаСчетахУчетаОС | Edm.Boolean | true |
| СтруктурноеПодразделениеОтправитель_Key | Edm.Guid | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| КраткийСоставМОЛ | Edm.String | true |
| КраткийСоставПодразделений | Edm.String | true |
| КраткийСоставНовыйМОЛОрганизации | Edm.String | true |
| КраткийСоставНовыйПодразделениеОрганизации | Edm.String | true |
| ОС | Document_ПеремещениеОС_ОС_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеОтправитель
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеПолучатель
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СобытияОС]] — СобытиеОС
