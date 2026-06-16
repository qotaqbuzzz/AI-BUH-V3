---
category: InformationRegister
properties: 5
relations: 2
---

# InformationRegister_ЦеныНоменклатурыДокументов

**Category:** InformationRegister  
**Properties:** 5  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Номенклатура_Key | Edm.Guid | false |
| СпособЗаполненияЦены | Edm.String | false |
| Цена | Edm.Double | true |
| ЦенаВключаетНДС | Edm.Boolean | true |
| Валюта_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_Номенклатура]] — Номенклатура
