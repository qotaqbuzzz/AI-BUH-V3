---
category: InformationRegister
properties: 5
relations: 2
---

# InformationRegister_СрокиПеречисленияНалоговСборовОтчислений

**Category:** InformationRegister  
**Properties:** 5  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Месяц | Edm.DateTime | false |
| Организация_Key | Edm.Guid | false |
| ВидНалога_Key | Edm.Guid | false |
| ПорядокОпределенияСрокаПеречисления | Edm.String | true |
| СрокПеречисления | Edm.DateTime | true |

## Related Entities

- [[Catalog_НалогиСборыОтчисления]] — ВидНалога
- [[Catalog_Организации]] — Организация
