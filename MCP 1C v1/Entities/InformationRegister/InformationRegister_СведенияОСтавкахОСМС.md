---
category: InformationRegister
properties: 5
relations: 1
---

# InformationRegister_СведенияОСтавкахОСМС

**Category:** InformationRegister  
**Properties:** 5  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| ВидДохода | Edm.String | false |
| Налогоплательщик_Key | Edm.Guid | false |
| СтавкаВзносы | Edm.Double | true |
| СтавкаОтчисления | Edm.Double | true |

## Related Entities

- [[Catalog_Организации]] — Налогоплательщик
