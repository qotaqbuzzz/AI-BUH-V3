---
category: Document
properties: 9
relations: 2
---

# Document_ИЛПеречислениеПолучателям_ИсполнительныеЛисты

**Category:** Document  
**Properties:** 9  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Получатель_Key | Edm.Guid | true |
| ДокументОснование_Key | Edm.Guid | true |
| СуммаВзаиморасчетов | Edm.Double | true |
| СуммаСборов | Edm.Double | true |
| СуммаПлатежа | Edm.Double | true |
| НомерВходящегоДокумента | Edm.String | true |
| ДатаВходящегоДокумента | Edm.DateTime | true |

## Related Entities

- [[Catalog_Контрагенты]] — Получатель
- [[Document_ИсполнительныйЛист]] — ДокументОснование
