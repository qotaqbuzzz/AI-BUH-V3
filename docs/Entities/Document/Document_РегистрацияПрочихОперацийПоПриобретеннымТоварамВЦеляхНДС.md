---
category: Document
properties: 53
relations: 14
---

# Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС

**Category:** Document  
**Properties:** 53  
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
| УчитыватьНДС | Edm.Boolean | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| НДСВключенВСтоимость | Edm.Boolean | true |
| СчетЗатратНДСБУ_Key | Edm.Guid | true |
| СубконтоЗатратНДСБУ1 | Edm.String | true |
| СубконтоЗатратНДСБУ2 | Edm.String | true |
| СубконтоЗатратНДСБУ3 | Edm.String | true |
| СчетЗатратНДСНУ_Key | Edm.Guid | true |
| СубконтоЗатратНДСНУ1 | Edm.String | true |
| СубконтоЗатратНДСНУ2 | Edm.String | true |
| СубконтоЗатратНДСНУ3 | Edm.String | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ВидВходящегоДокумента | Edm.String | true |
| НомерВходящегоДокумента | Edm.String | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СобытиеОС_Key | Edm.Guid | true |
| Товары | Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС_Товары_RowType | true |
| Услуги | Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС_Услуги_RowType | true |
| ОС | Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС_ОС_RowType | true |
| НМА | Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС_НМА_RowType | true |
| УчастникиСовместнойДеятельности | Document_РегистрацияПрочихОперацийПоПриобретеннымТоварамВЦеляхНДС_УчастникиСовместнойДеятельности_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| СубконтоЗатратНДСБУ1_Type | Edm.String | true |
| СубконтоЗатратНДСБУ2_Type | Edm.String | true |
| СубконтоЗатратНДСБУ3_Type | Edm.String | true |
| СубконтоЗатратНДСНУ1_Type | Edm.String | true |
| СубконтоЗатратНДСНУ2_Type | Edm.String | true |
| СубконтоЗатратНДСНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СобытияОС]] — СобытиеОС
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНДСНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратНДСБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
