---
category: Document
properties: 15
relations: 2
---

# Document_РегистрацияНДСЗаНерезидента_ДокументыПоступления

**Category:** Document  
**Properties:** 15  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ДатаПоступления | Edm.DateTime | true |
| Документ | Edm.String | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаСНДС | Edm.Double | true |
| СуммаВзаиморасчетов | Edm.Double | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| Номенклатура | Edm.String | true |
| Содержание | Edm.String | true |
| Документ_Type | Edm.String | true |
| Номенклатура_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_СтавкиНДС]] — СтавкаНДС
