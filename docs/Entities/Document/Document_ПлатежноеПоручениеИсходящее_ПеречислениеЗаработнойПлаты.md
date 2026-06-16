---
category: Document
properties: 4
relations: 1
---

# Document_ПлатежноеПоручениеИсходящее_ПеречислениеЗаработнойПлаты

**Category:** Document  
**Properties:** 4  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Ведомость_Key | Edm.Guid | true |
| СуммаКВыплате | Edm.Double | true |

## Related Entities

- [[Document_ЗарплатаКВыплатеОрганизаций]] — Ведомость
