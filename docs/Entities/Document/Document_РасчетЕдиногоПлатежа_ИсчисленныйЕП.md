---
category: Document
properties: 12
relations: 1
---

# Document_РасчетЕдиногоПлатежа_ИсчисленныйЕП

**Category:** Document  
**Properties:** 12  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| МесяцНалоговогоПериода | Edm.DateTime | true |
| ОблагаемаяБаза | Edm.Double | true |
| СуммаПлатежа | Edm.Double | true |
| СуммаОПВ | Edm.Double | true |
| СуммаВОСМС | Edm.Double | true |
| СуммаИПН | Edm.Double | true |
| СуммаСО | Edm.Double | true |
| СуммаООСМС | Edm.Double | true |
| СуммаОПВР | Edm.Double | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
