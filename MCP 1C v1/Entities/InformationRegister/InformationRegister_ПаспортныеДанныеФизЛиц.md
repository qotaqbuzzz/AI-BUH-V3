---
category: InformationRegister
properties: 8
relations: 2
---

# InformationRegister_ПаспортныеДанныеФизЛиц

**Category:** InformationRegister  
**Properties:** 8  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| ФизЛицо_Key | Edm.Guid | false |
| ДокументВид_Key | Edm.Guid | true |
| ДокументСерия | Edm.String | true |
| ДокументНомер | Edm.String | true |
| ДокументДатаВыдачи | Edm.DateTime | true |
| ДокументКемВыдан | Edm.String | true |
| ДокументСрокДействия | Edm.DateTime | true |

## Related Entities

- [[Catalog_ДокументыУдостоверяющиеЛичность]] — ДокументВид
- [[Catalog_ФизическиеЛица]] — ФизЛицо
