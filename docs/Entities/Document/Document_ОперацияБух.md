---
category: Document
properties: 20
relations: 5
---

# Document_ОперацияБух

**Category:** Document  
**Properties:** 20  
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
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| Содержание | Edm.String | true |
| СуммаОперации | Edm.Double | true |
| ТиповаяОперация_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СторнируемыйДокумент | Edm.String | true |
| СпособЗаполнения | Edm.String | true |
| ЗапрашиваемыеПараметры | Document_ОперацияБух_ЗапрашиваемыеПараметры_RowType | true |
| ТаблицаРегистровСведений | Document_ОперацияБух_ТаблицаРегистровСведений_RowType | true |
| ТаблицаРегистровНакопления | Document_ОперацияБух_ТаблицаРегистровНакопления_RowType | true |
| СторнируемыйДокумент_Type | Edm.String | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ТиповыеОперации]] — ТиповаяОперация
