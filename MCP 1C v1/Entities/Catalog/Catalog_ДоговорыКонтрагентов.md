---
category: Catalog
properties: 32
relations: 5
---

# Catalog_ДоговорыКонтрагентов

**Category:** Catalog  
**Properties:** 32  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| Owner_Key | Edm.Guid | true |
| Parent_Key | Edm.Guid | true |
| IsFolder | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| ВалютаВзаиморасчетов_Key | Edm.Guid | true |
| ВедениеВзаиморасчетов | Edm.String | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| ВидДоговора | Edm.String | true |
| УчетАгентскогоНДС | Edm.Boolean | true |
| НомерДоговора | Edm.String | true |
| ДатаДоговора | Edm.DateTime | true |
| ДатаНачалаДействияДоговора | Edm.DateTime | true |
| ДатаОкончанияДействияДоговора | Edm.DateTime | true |
| УстановленСрокОплаты | Edm.Boolean | true |
| СрокОплаты | Edm.Int64 | true |
| ДоговорСовместнойДеятельности | Edm.Boolean | true |
| УсловияОплаты | Edm.String | true |
| УсловияПоставки | Edm.String | true |
| УчастникСРП | Edm.Boolean | true |
| ПоверенныйОператор_Key | Edm.Guid | true |
| СпособВыпискиАктовВыполненныхРабот | Edm.String | true |
| УникальныйНомерВалютногоКонтроля | Edm.String | true |
| УчастникиСовместнойДеятельности | Catalog_ДоговорыКонтрагентов_УчастникиСовместнойДеятельности_RowType | true |
| ДополнительныеРеквизиты | Catalog_ДоговорыКонтрагентов_ДополнительныеРеквизиты_RowType | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаВзаиморасчетов
- [[Catalog_Контрагенты]] — Owner
- [[Catalog_Контрагенты]] — ПоверенныйОператор
- [[Catalog_Организации]] — Организация
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
