---
category: InformationRegister
properties: 4
relations: 2
---

# InformationRegister_СведенияОПенсионномОбеспеченииФизЛиц

**Category:** InformationRegister  
**Properties:** 4  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| ФизЛицо_Key | Edm.Guid | false |
| ПенсионныйФонд_Key | Edm.Guid | true |
| Пенсионер | Edm.Boolean | true |

## Related Entities

- [[Catalog_Контрагенты]] — ПенсионныйФонд
- [[Catalog_ФизическиеЛица]] — ФизЛицо
