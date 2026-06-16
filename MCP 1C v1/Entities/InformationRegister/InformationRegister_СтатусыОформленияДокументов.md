---
category: InformationRegister
properties: 6
relations: 2
---

# InformationRegister_СтатусыОформленияДокументов

**Category:** InformationRegister  
**Properties:** 6  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Организация_Key | Edm.Guid | false |
| Документ | Edm.String | false |
| Склад_Key | Edm.Guid | false |
| ДатаДокумента | Edm.DateTime | false |
| Статус | Edm.String | true |
| Документ_Type | Edm.String | false |

## Related Entities

- [[Catalog_ВиртуальныеСклады]] — Склад
- [[Catalog_Организации]] — Организация
