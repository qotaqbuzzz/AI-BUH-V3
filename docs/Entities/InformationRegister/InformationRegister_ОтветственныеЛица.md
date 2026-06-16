---
category: InformationRegister
properties: 3
relations: 2
---

# InformationRegister_ОтветственныеЛица

**Category:** InformationRegister  
**Properties:** 3  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| СтруктурнаяЕдиница_Key | Edm.Guid | false |
| ФизическоеЛицо_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Склады]] — СтруктурнаяЕдиница
- [[Catalog_ФизическиеЛица]] — ФизическоеЛицо
