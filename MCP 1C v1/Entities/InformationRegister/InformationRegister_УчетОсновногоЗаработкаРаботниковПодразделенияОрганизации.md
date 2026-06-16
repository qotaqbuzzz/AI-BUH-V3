---
category: InformationRegister
properties: 4
relations: 3
---

# InformationRegister_УчетОсновногоЗаработкаРаботниковПодразделенияОрганизации

**Category:** InformationRegister  
**Properties:** 4  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| Организация_Key | Edm.Guid | false |
| ПодразделениеОрганизации_Key | Edm.Guid | false |
| СпособОтраженияВБухучете_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВБухучете
