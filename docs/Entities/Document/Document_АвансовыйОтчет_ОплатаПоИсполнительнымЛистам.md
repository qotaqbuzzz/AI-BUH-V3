---
category: Document
properties: 6
relations: 1
---

# Document_АвансовыйОтчет_ОплатаПоИсполнительнымЛистам

**Category:** Document  
**Properties:** 6  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Документ_Key | Edm.Guid | true |
| СуммаКОплате | Edm.Double | true |
| СуммаСборов | Edm.Double | true |
| СуммаПлатежа | Edm.Double | true |

## Related Entities

- [[Document_ИЛПеречислениеПолучателям]] — Документ
