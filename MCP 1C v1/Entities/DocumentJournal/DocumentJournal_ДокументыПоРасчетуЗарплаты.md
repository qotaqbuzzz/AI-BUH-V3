---
category: DocumentJournal
properties: 16
relations: 4
---

# DocumentJournal_ДокументыПоРасчетуЗарплаты

**Category:** DocumentJournal  
**Properties:** 16  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref | Edm.String | false |
| Type | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Number | Edm.String | true |
| Posted | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Месяц | Edm.DateTime | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| Работники | Edm.String | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Ref_Type | Edm.String | false |
| Работники_Type | Edm.String | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
