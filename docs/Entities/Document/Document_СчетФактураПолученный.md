---
category: Document
properties: 40
relations: 10
---

# Document_СчетФактураПолученный

**Category:** Document  
**Properties:** 40  
**Relations:** 10

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
| ДатаВходящегоДокумента | Edm.DateTime | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| НомерВходящегоДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| ОсновнойСчетФактура_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПодтвержденДокументамиОтгрузки | Edm.Boolean | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Поставщик_Key | Edm.Guid | true |
| Покупатель_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| ВидСчетаФактуры | Edm.String | true |
| СпособПолучения | Edm.String | true |
| ДатаСовершенияОборотаПоРеализации | Edm.DateTime | true |
| УдалитьДополнительная | Edm.Boolean | true |
| ДатаОборотаВТабличнойЧасти | Edm.Boolean | true |
| Товары | Document_СчетФактураПолученный_Товары_RowType | true |
| Услуги | Document_СчетФактураПолученный_Услуги_RowType | true |
| ОС | Document_СчетФактураПолученный_ОС_RowType | true |
| НМА | Document_СчетФактураПолученный_НМА_RowType | true |
| ДокументыОснования | Document_СчетФактураПолученный_ДокументыОснования_RowType | true |
| УчастникиСовместнойДеятельности | Document_СчетФактураПолученный_УчастникиСовместнойДеятельности_RowType | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Контрагенты]] — Поставщик
- [[Catalog_Организации]] — Организация
- [[Catalog_Организации]] — Покупатель
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
