---
category: Document
properties: 72
relations: 16
---

# Document_ПлатежноеПоручениеИсходящее

**Category:** Document  
**Properties:** 72  
**Relations:** 16

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
| БанкПосредник | Edm.String | true |
| ВалютаДокумента_Key | Edm.Guid | true |
| ВидНалога_Key | Edm.Guid | true |
| ВидОперации | Edm.String | true |
| ВидПлатежа | Edm.String | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ВключатьКомиссиюБанка | Edm.Boolean | true |
| ДатаВалютирования | Edm.DateTime | true |
| ДатаВыписки | Edm.DateTime | true |
| ДатаПолученияТовара | Edm.DateTime | true |
| ДокументОснование | Edm.String | true |
| КодБК | Edm.String | true |
| КодНазначенияПлатежа | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| НазначениеПлатежа | Edm.String | true |
| Оплачено | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
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
| СчетБанкаПосредника_Key | Edm.Guid | true |
| СчетКонтрагента_Key | Edm.Guid | true |
| СчетОрганизации_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомБУ_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомНУ_Key | Edm.Guid | true |
| ТекстПлательщика | Edm.String | true |
| ТекстПолучателя | Edm.String | true |
| ПроцентКомиссии | Edm.Double | true |
| СуммаКомиссии | Edm.Double | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделениеОтправитель_Key | Edm.Guid | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |
| НомерВходящегоДокумента | Edm.String | true |
| ФактическийПлательщик | Edm.String | true |
| ПеречислениеЗаработнойПлаты | Document_ПлатежноеПоручениеИсходящее_ПеречислениеЗаработнойПлаты_RowType | true |
| РасшифровкаПлатежа | Document_ПлатежноеПоручениеИсходящее_РасшифровкаПлатежа_RowType | true |
| ПеречислениеПенсионныхВзносов | Document_ПлатежноеПоручениеИсходящее_ПеречислениеПенсионныхВзносов_RowType | true |
| ПеречислениеСоциальныхОтчислений | Document_ПлатежноеПоручениеИсходящее_ПеречислениеСоциальныхОтчислений_RowType | true |
| ПеречислениеПоИсполнительнымЛистам | Document_ПлатежноеПоручениеИсходящее_ПеречислениеПоИсполнительнымЛистам_RowType | true |
| ПеречислениеНДССИзмененнымСрокомУплаты | Document_ПлатежноеПоручениеИсходящее_ПеречислениеНДССИзмененнымСрокомУплаты_RowType | true |
| ПеречислениеВПодотчет | Document_ПлатежноеПоручениеИсходящее_ПеречислениеВПодотчет_RowType | true |
| ПеречислениеЕдиныхПлатежей | Document_ПлатежноеПоручениеИсходящее_ПеречислениеЕдиныхПлатежей_RowType | true |
| ПеречислениеПрочихВыплат | Document_ПлатежноеПоручениеИсходящее_ПеречислениеПрочихВыплат_RowType | true |
| ПеречислениеПрочихДоходов | Document_ПлатежноеПоручениеИсходящее_ПеречислениеПрочихДоходов_RowType | true |
| БанкПосредник_Type | Edm.String | true |
| ДокументОснование_Type | Edm.String | true |
| СубконтоДтБУ1_Type | Edm.String | true |
| СубконтоДтБУ2_Type | Edm.String | true |
| СубконтоДтБУ3_Type | Edm.String | true |
| СубконтоДтНУ1_Type | Edm.String | true |
| СубконтоДтНУ2_Type | Edm.String | true |
| СубконтоДтНУ3_Type | Edm.String | true |
| ФактическийПлательщик_Type | Edm.String | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — СчетБанкаПосредника
- [[Catalog_БанковскиеСчета]] — СчетКонтрагента
- [[Catalog_БанковскиеСчета]] — СчетОрганизации
- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_НалогиСборыОтчисления]] — ВидНалога
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеОтправитель
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеПолучатель
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
- [[ChartOfAccounts_Налоговый]] — СчетУчетаРасчетовСКонтрагентомНУ
- [[ChartOfAccounts_Типовой]] — СчетБанк
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентомБУ
