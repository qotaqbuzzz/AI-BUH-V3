---
category: Document
properties: 5
relations: 1
---

# Document_РеализацияТоваровУслуг_ЗерновыеРасписки

**Category:** Document  
**Properties:** 5  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Расписка_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Сумма | Edm.Double | true |

## Related Entities

- [[Document_ЗерноваяРасписка]] — Расписка
