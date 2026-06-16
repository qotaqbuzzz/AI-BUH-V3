---
category: Document
properties: 19
relations: 6
---

# Document_СОВозвратОтчислений

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
| Автор_Key | Edm.Guid | true |
| ВидПлатежа | Edm.String | true |
| ДокументОснование_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПериодРегистрации | Edm.DateTime | true |
| СуммаДокумента | Edm.Double | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| СоциальныеОтчисления | Document_СОВозвратОтчислений_СоциальныеОтчисления_RowType | true |

## Related Entities

- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Document_СОПеречислениеВФонды]] — ДокументОснование
