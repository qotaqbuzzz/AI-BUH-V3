---
category: Document
properties: 16
relations: 4
---

# Document_ИЛПеречислениеПолучателям

**Category:** Document  
**Properties:** 16  
**Relations:** 4

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
| СпособПеречисления | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ИсполнительныеЛисты | Document_ИЛПеречислениеПолучателям_ИсполнительныеЛисты_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
