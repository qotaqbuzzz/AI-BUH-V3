---
category: InformationRegister
properties: 6
relations: 1
---

# InformationRegister_СтатусыДокументов

**Category:** InformationRegister  
**Properties:** 6  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Организация_Key | Edm.Guid | false |
| Документ | Edm.String | false |
| Статус | Edm.String | true |
| ДополнительныйСтатус | Edm.String | true |
| Документ_Type | Edm.String | false |
| ДополнительныйСтатус_Type | Edm.String | true |

## Related Entities

- [[Catalog_Организации]] — Организация
