---
category: InformationRegister
properties: 6
relations: 5
---

# InformationRegister_СведенияОСтавкахРозничногоНалога

**Category:** InformationRegister  
**Properties:** 6  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| Организация_Key | Edm.Guid | false |
| СтруктурноеПодразделение_Key | Edm.Guid | false |
| Подразделение_Key | Edm.Guid | false |
| ВидДохода_Key | Edm.Guid | false |
| Ставка_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Доходы]] — ВидДохода
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — Подразделение
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_СтавкиРозничногоНалога]] — Ставка
