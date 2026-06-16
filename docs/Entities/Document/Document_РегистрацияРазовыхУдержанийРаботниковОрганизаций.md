---
category: Document
properties: 17
relations: 5
---

# Document_РегистрацияРазовыхУдержанийРаботниковОрганизаций

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
| Автор_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| КраткийСоставВидовРасчетаДокумента | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Удержания | Document_РегистрацияРазовыхУдержанийРаботниковОрганизаций_Удержания_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
