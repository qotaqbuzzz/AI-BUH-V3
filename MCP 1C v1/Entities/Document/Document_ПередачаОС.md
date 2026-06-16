---
category: Document
properties: 44
relations: 13
---

# Document_ПередачаОС

**Category:** Document  
**Properties:** 44  
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
| ДокументОснованиеВид | Edm.String | true |
| ДокументОснованиеДата | Edm.DateTime | true |
| ДокументОснованиеНомер | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Сделка | Edm.String | true |
| СобытиеОС_Key | Edm.Guid | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ДоверенностьНомер | Edm.String | true |
| ДоверенностьДата | Edm.DateTime | true |
| ДоверенностьВыдана | Edm.String | true |
| ОС | Document_ПередачаОС_ОС_RowType | true |
| ИнвентаризационнаяКомиссия | Document_ПередачаОС_ИнвентаризационнаяКомиссия_RowType | true |
| УчастникиСовместнойДеятельности | Document_ПередачаОС_УчастникиСовместнойДеятельности_RowType | true |
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
- [[Catalog_СобытияОС]] — СобытиеОС
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
