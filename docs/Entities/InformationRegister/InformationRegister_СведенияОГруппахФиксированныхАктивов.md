---
category: InformationRegister
properties: 8
relations: 2
---

# InformationRegister_СведенияОГруппахФиксированныхАктивов

**Category:** InformationRegister  
**Properties:** 8  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| Организация_Key | Edm.Guid | false |
| ГруппаФА_Key | Edm.Guid | false |
| ФиксированныйАктив | Edm.String | false |
| ПредельнаяНормаАмортизации | Edm.Double | true |
| ПрименяемаяНормаАмортизации | Edm.Double | true |
| ВычетНаРемонт | Edm.Double | true |
| ФиксированныйАктив_Type | Edm.String | false |

## Related Entities

- [[Catalog_ГруппыНалоговогоУчетаФА]] — ГруппаФА
- [[Catalog_Организации]] — Организация
