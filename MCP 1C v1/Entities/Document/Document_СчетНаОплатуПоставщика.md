---
category: Document
properties: 29
relations: 9
---

# Document_СчетНаОплатуПоставщика

**Category:** Document  
**Properties:** 29  
**Relations:** 9

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
| ВалютаДокумента_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| КодНазначенияПлатежа | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| Склад_Key | Edm.Guid | true |
| СтруктурнаяЕдиница | Edm.String | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| НомерВходящегоДокумента | Edm.String | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| Товары | Document_СчетНаОплатуПоставщика_Товары_RowType | true |
| Услуги | Document_СчетНаОплатуПоставщика_Услуги_RowType | true |
| ОС | Document_СчетНаОплатуПоставщика_ОС_RowType | true |
| СтруктурнаяЕдиница_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
