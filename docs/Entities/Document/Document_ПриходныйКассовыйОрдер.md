---
category: Document
properties: 50
relations: 15
---

# Document_ПриходныйКассовыйОрдер

**Category:** Document  
**Properties:** 50  
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
| ВидЗадолженностиПодотчетногоЛица | Edm.String | true |
| ВидОперации | Edm.String | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Касса_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Основание | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| Приложение | Edm.String | true |
| ПринятоОт | Edm.String | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| СубконтоКтБУ1 | Edm.String | true |
| СубконтоКтБУ2 | Edm.String | true |
| СубконтоКтБУ3 | Edm.String | true |
| СубконтоКтНУ1 | Edm.String | true |
| СубконтоКтНУ2 | Edm.String | true |
| СубконтоКтНУ3 | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СчетКасса_Key | Edm.Guid | true |
| СчетОрганизации_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомБУ_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| СтруктурноеПодразделениеОтправитель_Key | Edm.Guid | true |
| НомерЧекаККМ | Edm.Int64 | true |
| РасшифровкаПлатежа | Document_ПриходныйКассовыйОрдер_РасшифровкаПлатежа_RowType | true |
| ВыдачаВПодотчет | Document_ПриходныйКассовыйОрдер_ВыдачаВПодотчет_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| Контрагент_Type | Edm.String | true |
| СубконтоКтБУ1_Type | Edm.String | true |
| СубконтоКтБУ2_Type | Edm.String | true |
| СубконтоКтБУ3_Type | Edm.String | true |
| СубконтоКтНУ1_Type | Edm.String | true |
| СубконтоКтНУ2_Type | Edm.String | true |
| СубконтоКтНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — СчетОрганизации
- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Кассы]] — Касса
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеОтправитель
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеПолучатель
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
- [[ChartOfAccounts_Налоговый]] — СчетУчетаРасчетовСКонтрагентомНУ
- [[ChartOfAccounts_Типовой]] — СчетКасса
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентомБУ
