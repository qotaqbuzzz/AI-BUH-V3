---
category: Document
properties: 9
relations: 4
---

# Document_ОтражениеЗарплатыВБухучете_ОборотПоПриобретеннымУслугамГПХВЦеляхНДС

**Category:** Document  
**Properties:** 9  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Контрагент_Key | Edm.Guid | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_СтавкиНДС]] — СтавкаНДС
