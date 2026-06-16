---
category: Document
properties: 56
relations: 14
---

# Document_ПлатежныйОрдерСписаниеДенежныхСредств

**Category:** Document  
**Properties:** 56  
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
| ВидПлатежа | Edm.String | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДатаВыписки | Edm.DateTime | true |
| ДокументОснование | Edm.String | true |
| КодБК | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| НазначениеПлатежа | Edm.String | true |
| Оплачено | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ОчередностьПлатежа | Edm.Int16 | true |
| РННПлательщика | Edm.String | true |
| РННПолучателя | Edm.String | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| СубконтоДтБУ1 | Edm.String | true |
| СубконтоДтБУ2 | Edm.String | true |
| СубконтоДтБУ3 | Edm.String | true |
| СубконтоДтНУ1 | Edm.String | true |
| СубконтоДтНУ2 | Edm.String | true |
| СубконтоДтНУ3 | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| СчетБанк_Key | Edm.Guid | true |
| СчетКонтрагента_Key | Edm.Guid | true |
| СчетОрганизации_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомБУ_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомНУ_Key | Edm.Guid | true |
| ТекстПлательщика | Edm.String | true |
| ТекстПолучателя | Edm.String | true |
| ВключатьКомиссиюБанка | Edm.Boolean | true |
| СуммаКомиссии | Edm.Double | true |
| ПроцентКомиссии | Edm.Double | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделениеОтправитель_Key | Edm.Guid | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| НомерВходящегоДокумента | Edm.String | true |
| РасшифровкаПлатежа | Document_ПлатежныйОрдерСписаниеДенежныхСредств_РасшифровкаПлатежа_RowType | true |
| ПеречислениеЗаработнойПлаты | Document_ПлатежныйОрдерСписаниеДенежныхСредств_ПеречислениеЗаработнойПлаты_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| СубконтоДтБУ1_Type | Edm.String | true |
| СубконтоДтБУ2_Type | Edm.String | true |
| СубконтоДтБУ3_Type | Edm.String | true |
| СубконтоДтНУ1_Type | Edm.String | true |
| СубконтоДтНУ2_Type | Edm.String | true |
| СубконтоДтНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — СчетКонтрагента
- [[Catalog_БанковскиеСчета]] — СчетОрганизации
- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеОтправитель
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеПолучатель
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
- [[ChartOfAccounts_Налоговый]] — СчетУчетаРасчетовСКонтрагентомНУ
- [[ChartOfAccounts_Типовой]] — СчетБанк
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентомБУ
