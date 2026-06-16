---
category: Catalog
properties: 50
relations: 10
---

# Catalog_БанковскиеСчета

**Category:** Catalog  
**Properties:** 50  
**Relations:** 10

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| Owner | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| Банк_Key | Edm.Guid | true |
| БанкДляРасчетов_Key | Edm.Guid | true |
| ВалютаДенежныхСредств_Key | Edm.Guid | true |
| ВидСчета | Edm.String | true |
| ДатаЗакрытия | Edm.DateTime | true |
| ДатаОткрытия | Edm.DateTime | true |
| МесяцПрописью | Edm.Boolean | true |
| НомерСчета | Edm.String | true |
| Префикс | Edm.String | true |
| СуммаБезДробнойЧасти | Edm.Boolean | true |
| ТекстКорреспондента | Edm.String | true |
| ТекстНазначения | Edm.String | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| СтатьяДвиженияДенежныхСредств_Key | Edm.Guid | true |
| ПроцентКомиссии | Edm.Double | true |
| УчитыватьНДС | Edm.Boolean | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| СубконтоЗатратБУ1 | Edm.String | true |
| СубконтоЗатратБУ2 | Edm.String | true |
| СубконтоЗатратБУ3 | Edm.String | true |
| СубконтоЗатратНУ1 | Edm.String | true |
| СубконтоЗатратНУ2 | Edm.String | true |
| СубконтоЗатратНУ3 | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| ОбменСБанкомВключен | Edm.Boolean | true |
| ИспользоватьПрямойОбменСБанком | Edm.Boolean | true |
| ИспользоватьОбменСБанком | Edm.Boolean | true |
| Программа | Edm.String | true |
| Кодировка | Edm.String | true |
| ФайлЗагрузки | Edm.String | true |
| ФайлВыгрузки | Edm.String | true |
| Owner_Type | Edm.String | true |
| СубконтоЗатратБУ1_Type | Edm.String | true |
| СубконтоЗатратБУ2_Type | Edm.String | true |
| СубконтоЗатратБУ3_Type | Edm.String | true |
| СубконтоЗатратНУ1_Type | Edm.String | true |
| СубконтоЗатратНУ2_Type | Edm.String | true |
| СубконтоЗатратНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Банки]] — Банк
- [[Catalog_Банки]] — БанкДляРасчетов
- [[Catalog_Валюты]] — ВалютаДенежныхСредств
- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[Catalog_СтатьиДвиженияДенежныхСредств]] — СтатьяДвиженияДенежныхСредств
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
