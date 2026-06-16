---
category: InformationRegister
properties: 4
relations: 2
---

# InformationRegister_СпособОценкиЗапасовБУ

**Category:** InformationRegister  
**Properties:** 4  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| СчетЗапасов_Key | Edm.Guid | false |
| Организация_Key | Edm.Guid | false |
| СпособОценки | Edm.String | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[ChartOfAccounts_Типовой]] — СчетЗапасов
