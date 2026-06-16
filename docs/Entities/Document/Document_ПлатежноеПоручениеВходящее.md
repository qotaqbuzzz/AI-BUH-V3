---
category: Document
properties: 52
relations: 14
---

# Document_ПлатежноеПоручениеВходящее

**Category:** Document  
**Properties:** 52  
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
| ДатаВыписки | Edm.DateTime | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КурсНаДатуПриобретенияРеализацииВалюты | Edm.Double | true |
| НомерВходящегоДокумента | Edm.String | true |
| Оплачено | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| СубконтоКтБУ1 | Edm.String | true |
| СубконтоКтБУ2 | Edm.String | true |
| СубконтоКтБУ3 | Edm.String | true |
| СубконтоКтНУ1 | Edm.String | true |
| СубконтоКтНУ2 | Edm.String | true |
| СубконтоКтНУ3 | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| СчетБанк_Key | Edm.Guid | true |
| СчетКонтрагента_Key | Edm.Guid | true |
| СчетОрганизации_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомБУ_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентомНУ_Key | Edm.Guid | true |
| ВидВходящегоДокумента | Edm.String | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| СтруктурноеПодразделениеОтправитель_Key | Edm.Guid | true |
| НазначениеПлатежа | Edm.String | true |
| РасшифровкаПлатежа | Document_ПлатежноеПоручениеВходящее_РасшифровкаПлатежа_RowType | true |
| ВозвратПенсионныхВзносов | Document_ПлатежноеПоручениеВходящее_ВозвратПенсионныхВзносов_RowType | true |
| ВозвратСоциальныхОтчислений | Document_ПлатежноеПоручениеВходящее_ВозвратСоциальныхОтчислений_RowType | true |
| ВозвратЗаработнойПлаты | Document_ПлатежноеПоручениеВходящее_ВозвратЗаработнойПлаты_RowType | true |
| ВозвратЕдиногоПлатежа | Document_ПлатежноеПоручениеВходящее_ВозвратЕдиногоПлатежа_RowType | true |
| ВозвратПрочихВыплат | Document_ПлатежноеПоручениеВходящее_ВозвратПрочихВыплат_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| СубконтоКтБУ1_Type | Edm.String | true |
| СубконтоКтБУ2_Type | Edm.String | true |
| СубконтоКтБУ3_Type | Edm.String | true |
| СубконтоКтНУ1_Type | Edm.String | true |
| СубконтоКтНУ2_Type | Edm.String | true |
| СубконтоКтНУ3_Type | Edm.String | true |

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
