---
category: Document
properties: 44
relations: 14
---

# Document_ПоступлениеТоваровУслуг

**Category:** Document  
**Properties:** 44  
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
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| НДСВключенВСтоимость | Edm.Boolean | true |
| НомерВходящегоДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Сделка | Edm.String | true |
| Склад_Key | Edm.Guid | true |
| СобытиеОС_Key | Edm.Guid | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| ВидВходящегоДокумента | Edm.String | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ОтложитьПринятиеНДСКЗачету | Edm.Boolean | true |
| НаличиеОригинала | Edm.Boolean | true |
| СчетНаОплатуПоставщика_Key | Edm.Guid | true |
| Товары | Document_ПоступлениеТоваровУслуг_Товары_RowType | true |
| Услуги | Document_ПоступлениеТоваровУслуг_Услуги_RowType | true |
| ОС | Document_ПоступлениеТоваровУслуг_ОС_RowType | true |
| УчастникиСовместнойДеятельности | Document_ПоступлениеТоваровУслуг_УчастникиСовместнойДеятельности_RowType | true |
| ЗерновыеРасписки | Document_ПоступлениеТоваровУслуг_ЗерновыеРасписки_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| Сделка_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[Catalog_СобытияОС]] — СобытиеОС
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
- [[Document_СчетНаОплатуПоставщика]] — СчетНаОплатуПоставщика
