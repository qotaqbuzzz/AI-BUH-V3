---
category: InformationRegister
properties: 3
relations: 2
---

# InformationRegister_ИПНПрименениеВычетов

**Category:** InformationRegister  
**Properties:** 3  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| Физлицо_Key | Edm.Guid | false |
| Налогоплательщик_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Организации]] — Налогоплательщик
- [[Catalog_ФизическиеЛица]] — Физлицо
