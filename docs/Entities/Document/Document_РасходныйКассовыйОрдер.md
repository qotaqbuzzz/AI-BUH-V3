---
category: Document
properties: 51
relations: 13
---

# Document_РасходныйКассовыйОрдер

**Category:** Document  
**Properties:** 51  
**Relations:** 13

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
| Выдать | Edm.String | true |
| ДокументОснование | Edm.String | true |
| Касса_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Основание | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| ПлатежнаяВедомость | Edm.String | true |
| ПоДокументу | Edm.String | true |
| Приложение | Edm.String | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| СубконтоДтБУ1 | Edm.String | true |
| СубконтоДтБУ2 | Edm.String | true |
| СубконтоДтБУ3 | Edm.String | true |
| СубконтоДтНУ1 | Edm.String | true |
| СубконтоДтНУ2 | Edm.String | true |
| СубконтоДтНУ3 | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| СчетКасса_Key | Edm.Guid | true |
| СчетОрганизации_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомБУ_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделениеОтправитель_Key | Edm.Guid | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| НомерЧекаККМ | Edm.Int64 | true |
| ВыплатаЗаработнойПлаты | Document_РасходныйКассовыйОрдер_ВыплатаЗаработнойПлаты_RowType | true |
| РасшифровкаПлатежа | Document_РасходныйКассовыйОрдер_РасшифровкаПлатежа_RowType | true |
| ВыдачаВПодотчет | Document_РасходныйКассовыйОрдер_ВыдачаВПодотчет_RowType | true |
| ВыплатаПоИсполнительнымЛистам | Document_РасходныйКассовыйОрдер_ВыплатаПоИсполнительнымЛистам_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| Контрагент_Type | Edm.String | true |
| ПлатежнаяВедомость_Type | Edm.String | true |
| СубконтоДтБУ1_Type | Edm.String | true |
| СубконтоДтБУ2_Type | Edm.String | true |
| СубконтоДтБУ3_Type | Edm.String | true |
| СубконтоДтНУ1_Type | Edm.String | true |
| СубконтоДтНУ2_Type | Edm.String | true |
| СубконтоДтНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — СчетОрганизации
- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Кассы]] — Касса
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеОтправитель
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеПолучатель
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
- [[ChartOfAccounts_Налоговый]] — СчетУчетаРасчетовСКонтрагентомНУ
- [[ChartOfAccounts_Типовой]] — СчетКасса
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентомБУ
