---
category: InformationRegister
properties: 4
relations: 3
---

# InformationRegister_ОсновныеДоговорыКонтрагента

**Category:** InformationRegister  
**Properties:** 4  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Организация_Key | Edm.Guid | false |
| Контрагент_Key | Edm.Guid | false |
| ВидДоговора | Edm.String | false |
| Договор_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — Договор
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
