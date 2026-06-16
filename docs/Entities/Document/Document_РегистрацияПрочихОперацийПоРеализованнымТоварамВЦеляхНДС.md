---
category: Document
properties: 36
relations: 11
---

# Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС

**Category:** Document  
**Properties:** 36  
**Relations:** 11

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
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ОтражатьВБухгалтерскомУчете | Edm.Boolean | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| ТипЦен_Key | Edm.Guid | true |
| УсловияОплаты | Edm.String | true |
| УчитыватьНДС | Edm.Boolean | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| Товары | Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_Товары_RowType | true |
| Услуги | Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_Услуги_RowType | true |
| ОС | Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_ОС_RowType | true |
| НМА | Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_НМА_RowType | true |
| УчастникиСовместнойДеятельности | Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_УчастникиСовместнойДеятельности_RowType | true |
| НомераГТД | Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_НомераГТД_RowType | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
