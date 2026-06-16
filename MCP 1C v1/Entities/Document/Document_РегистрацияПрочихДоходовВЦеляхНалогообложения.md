---
category: Document
properties: 20
relations: 6
---

# Document_РегистрацияПрочихДоходовВЦеляхНалогообложения

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
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |
| СведенияОДоходах | Document_РегистрацияПрочихДоходовВЦеляхНалогообложения_СведенияОДоходах_RowType | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
