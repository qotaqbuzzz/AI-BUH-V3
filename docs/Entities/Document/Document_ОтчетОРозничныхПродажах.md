---
category: Document
properties: 40
relations: 15
---

# Document_ОтчетОРозничныхПродажах

**Category:** Document  
**Properties:** 40  
**Relations:** 15

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
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументБезНДС | Edm.Boolean | true |
| ДокументОснование | Edm.String | true |
| Касса_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КратностьДокумента | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| КурсДокумента | Edm.Double | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СуммаВключаетАкциз | Edm.Boolean | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетКасса_Key | Edm.Guid | true |
| СчетУчетаРасчетовПоВозвратам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьАкциз | Edm.Boolean | true |
| УчитыватьКПН | Edm.Boolean | true |
| УчитыватьНДС | Edm.Boolean | true |
| НомераГТД | Document_ОтчетОРозничныхПродажах_НомераГТД_RowType | true |
| Оплата | Document_ОтчетОРозничныхПродажах_Оплата_RowType | true |
| Товары | Document_ОтчетОРозничныхПродажах_Товары_RowType | true |
| Услуги | Document_ОтчетОРозничныхПродажах_Услуги_RowType | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Кассы]] — Касса
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[ChartOfAccounts_Типовой]] — СчетКасса
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоВозвратам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
