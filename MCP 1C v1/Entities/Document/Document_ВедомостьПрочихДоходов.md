---
category: Document
properties: 19
relations: 6
---

# Document_ВедомостьПрочихДоходов

**Category:** Document  
**Properties:** 19  
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
| ПериодРегистрации | Edm.DateTime | true |
| Банк_Key | Edm.Guid | true |
| ВидВыплаты | Edm.String | true |
| СпособВыплаты | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СуммаДокумента | Edm.Double | true |
| КраткийСоставДокумента | Edm.String | true |
| Комментарий | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| Автор_Key | Edm.Guid | true |
| Выплаты | Document_ВедомостьПрочихДоходов_Выплаты_RowType | true |

## Related Entities

- [[Catalog_Банки]] — Банк
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
