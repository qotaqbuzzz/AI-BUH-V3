---
category: InformationRegister
properties: 7
relations: 1
---

# InformationRegister_СостоянияРассылокОтчетов

**Category:** InformationRegister  
**Properties:** 7  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Рассылка_Key | Edm.Guid | false |
| ПоследнийЗапускНачало | Edm.DateTime | true |
| ПоследнийЗапускЗавершение | Edm.DateTime | true |
| УспешныйЗапуск | Edm.DateTime | true |
| Выполнена | Edm.Boolean | true |
| СОшибками | Edm.Boolean | true |
| НомерСеанса | Edm.Int64 | true |

## Related Entities

- [[Catalog_РассылкиОтчетов]] — Рассылка
