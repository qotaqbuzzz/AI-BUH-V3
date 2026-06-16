---
category: Document
properties: 35
relations: 14
---

# Document_ЧекККМ

**Category:** Document  
**Properties:** 35  
**Relations:** 14

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
| ВидОперации | Edm.String | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ИдентификаторУстройства_Key | Edm.Guid | true |
| Касса_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КратностьДокумента | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| КурсДокумента | Edm.Double | true |
| НомерЧекаККМ | Edm.Int64 | true |
| Организация_Key | Edm.Guid | true |
| Основание_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ОтчетОРозничныхПродажах_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетНаОплатуПокупателю_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| Товары | Document_ЧекККМ_Товары_RowType | true |
| Оплата | Document_ЧекККМ_Оплата_RowType | true |
| Услуги | Document_ЧекККМ_Услуги_RowType | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Кассы]] — Касса
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодключаемоеОборудование]] — ИдентификаторУстройства
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[Document_ОтчетОРозничныхПродажах]] — ОтчетОРозничныхПродажах
- [[Document_СчетНаОплатуПокупателю]] — СчетНаОплатуПокупателю
