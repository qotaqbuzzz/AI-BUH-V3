---
category: Document
properties: 17
relations: 6
---

# Document_УстановкаЦенНоменклатуры

**Category:** Document  
**Properties:** 17  
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
| ДокументОснование_Key | Edm.Guid | true |
| УдалитьИнформация | Edm.String | true |
| Комментарий | Edm.String | true |
| НеПроводитьНулевыеЗначения | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| ТипЦен_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Товары | Document_УстановкаЦенНоменклатуры_Товары_RowType | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[Document_ПоступлениеТоваровУслуг]] — ДокументОснование
