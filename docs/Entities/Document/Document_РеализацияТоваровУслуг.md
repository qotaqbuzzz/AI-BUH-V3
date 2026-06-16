---
category: Document
properties: 55
relations: 14
---

# Document_РеализацияТоваровУслуг

**Category:** Document  
**Properties:** 55  
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
| АдресДоставки | Edm.String | true |
| БанковскийСчетОрганизации_Key | Edm.Guid | true |
| ВалютаДокумента_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| Грузополучатель_Key | Edm.Guid | true |
| УдалитьДоверенность | Edm.String | true |
| ДоверенностьЛицо | Edm.String | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Сделка | Edm.String | true |
| Склад_Key | Edm.Guid | true |
| СуммаВключаетАкциз | Edm.Boolean | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьАкциз | Edm.Boolean | true |
| УчитыватьНДС | Edm.Boolean | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ДатаНачалаОтчетногоПериода | Edm.DateTime | true |
| ДатаОкончанияОтчетногоПериода | Edm.DateTime | true |
| ПереченьДокументации | Edm.String | true |
| ДоверенностьВыдана | Edm.String | true |
| ДоверенностьДата | Edm.DateTime | true |
| ДоверенностьНомер | Edm.String | true |
| НомерДокументаГЗ | Edm.String | true |
| ДатаДокументаГЗ | Edm.DateTime | true |
| ДатаПодписанияГЗ | Edm.DateTime | true |
| НаличиеОригинала | Edm.Boolean | true |
| СпособВыпискиАктовВыполненныхРабот | Edm.String | true |
| ОтложитьНачислениеНДС | Edm.Boolean | true |
| Товары | Document_РеализацияТоваровУслуг_Товары_RowType | true |
| Услуги | Document_РеализацияТоваровУслуг_Услуги_RowType | true |
| УчастникиСовместнойДеятельности | Document_РеализацияТоваровУслуг_УчастникиСовместнойДеятельности_RowType | true |
| НомераГТД | Document_РеализацияТоваровУслуг_НомераГТД_RowType | true |
| ЗерновыеРасписки | Document_РеализацияТоваровУслуг_ЗерновыеРасписки_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| Сделка_Type | Edm.String | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — БанковскийСчетОрганизации
- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Грузополучатель
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
