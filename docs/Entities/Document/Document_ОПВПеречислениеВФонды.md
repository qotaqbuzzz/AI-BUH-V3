---
category: Document
properties: 22
relations: 7
---

# Document_ОПВПеречислениеВФонды

**Category:** Document  
**Properties:** 22  
**Relations:** 7

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
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| СуммаДокумента | Edm.Double | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СпособРасчетаСуммКПеречислению | Edm.String | true |
| ВидОперации | Edm.String | true |
| ПорядокЗаполнения | Edm.Int16 | true |
| ПенсионныеВзносы | Document_ОПВПеречислениеВФонды_ПенсионныеВзносы_RowType | true |

## Related Entities

- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Document_РасчетПениОПВиСО]] — ДокументОснование
