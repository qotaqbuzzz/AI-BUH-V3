---
category: InformationRegister
properties: 6
relations: 2
---

# InformationRegister_СведенияОСтавкахНалоговСборовОтчислений

**Category:** InformationRegister  
**Properties:** 6  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| Налогоплательщик_Key | Edm.Guid | false |
| ВидНалога_Key | Edm.Guid | false |
| ВидДохода | Edm.String | false |
| Ставка | Edm.Double | true |
| СтавкаПревышения | Edm.Double | true |

## Related Entities

- [[Catalog_НалогиСборыОтчисления]] — ВидНалога
- [[Catalog_Организации]] — Налогоплательщик
