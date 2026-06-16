---
category: Document
properties: 71
relations: 19
---

# Document_ПередачаНМА

**Category:** Document  
**Properties:** 71  
**Relations:** 19

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
| ВидУчетаНУ_Key | Edm.Guid | true |
| УдалитьДоверенность | Edm.String | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| НематериальныйАктив_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Сделка | Edm.String | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СубконтоДоходовНУ1 | Edm.String | true |
| СубконтоДоходовНУ2 | Edm.String | true |
| СубконтоДоходовНУ3 | Edm.String | true |
| СубконтоРасходовБУ1 | Edm.String | true |
| СубконтоРасходовБУ2 | Edm.String | true |
| СубконтоРасходовБУ3 | Edm.String | true |
| СубконтоРасходовНУ1 | Edm.String | true |
| СубконтоРасходовНУ2 | Edm.String | true |
| СубконтоРасходовНУ3 | Edm.String | true |
| Сумма | Edm.Double | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СчетДоходовНУ_Key | Edm.Guid | true |
| СчетРасходовБУ_Key | Edm.Guid | true |
| СчетРасходовНУ_Key | Edm.Guid | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| СчетУчетаРасчетовПоАвансам_Key | Edm.Guid | true |
| СчетУчетаРасчетовСКонтрагентом_Key | Edm.Guid | true |
| УчитыватьНДС | Edm.Boolean | true |
| ДоверенностьЛицо | Edm.String | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ДоверенностьНомер | Edm.String | true |
| ДоверенностьДата | Edm.DateTime | true |
| ДоверенностьВыдана | Edm.String | true |
| ДокументОснованиеВид | Edm.String | true |
| ДокументОснованиеДата | Edm.DateTime | true |
| ДокументОснованиеНомер | Edm.String | true |
| УчастникиСовместнойДеятельности | Document_ПередачаНМА_УчастникиСовместнойДеятельности_RowType | true |
| ИнвентаризационнаяКомиссия | Document_ПередачаНМА_ИнвентаризационнаяКомиссия_RowType | true |
| Сделка_Type | Edm.String | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |
| СубконтоДоходовНУ1_Type | Edm.String | true |
| СубконтоДоходовНУ2_Type | Edm.String | true |
| СубконтоДоходовНУ3_Type | Edm.String | true |
| СубконтоРасходовБУ1_Type | Edm.String | true |
| СубконтоРасходовБУ2_Type | Edm.String | true |
| СубконтоРасходовБУ3_Type | Edm.String | true |
| СубконтоРасходовНУ1_Type | Edm.String | true |
| СубконтоРасходовНУ2_Type | Edm.String | true |
| СубконтоРасходовНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_НематериальныеАктивы]] — НематериальныйАктив
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетДоходовНУ
- [[ChartOfAccounts_Налоговый]] — СчетРасходовНУ
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетРасходовБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовПоАвансам
- [[ChartOfAccounts_Типовой]] — СчетУчетаРасчетовСКонтрагентом
- [[Document_СчетФактураВыданный]] — ДокументОснование
