---
category: Document
properties: 48
relations: 18
---

# Document_АктОбОказанииПроизводственныхУслуг

**Category:** Document  
**Properties:** 48  
**Relations:** 18

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
| ВидУчетаНУ_Key | Edm.Guid | true |
| Грузополучатель_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| УдалитьНДСВключенВСтоимость | Edm.Boolean | true |
| НоменклатурнаяГруппа_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Сделка | Edm.String | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| УДАЛИТЬСтруктурноеПодразделениеЗатрат_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| ДатаНачалаОтчетногоПериода | Edm.DateTime | true |
| ДатаОкончанияОтчетногоПериода | Edm.DateTime | true |
| ПереченьДокументации | Edm.String | true |
| НомерДокументаГЗ | Edm.String | true |
| ДатаДокументаГЗ | Edm.DateTime | true |
| ДатаПодписанияГЗ | Edm.DateTime | true |
| СпособВыпискиАктовВыполненныхРабот | Edm.String | true |
| ОтложитьНачислениеНДС | Edm.Boolean | true |
| Услуги | Document_АктОбОказанииПроизводственныхУслуг_Услуги_RowType | true |
| УчастникиСовместнойДеятельности | Document_АктОбОказанииПроизводственныхУслуг_УчастникиСовместнойДеятельности_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| Сделка_Type | Edm.String | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — БанковскийСчетОрганизации
- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Грузополучатель
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_НоменклатурныеГруппы]] — НоменклатурнаяГруппа
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_ПодразделенияОрганизаций]] — УДАЛИТЬСтруктурноеПодразделениеЗатрат
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
