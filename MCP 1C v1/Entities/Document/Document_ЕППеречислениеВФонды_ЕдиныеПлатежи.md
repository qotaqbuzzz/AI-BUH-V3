---
category: Document
properties: 12
relations: 1
---

# Document_ЕППеречислениеВФонды_ЕдиныеПлатежи

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
| Сумма | Edm.Double | true |
| СуммаПлатежа | Edm.Double | true |
| ВключаетОПВ | Edm.Boolean | true |
| ВключаетВОСМС | Edm.Boolean | true |
| ВключаетИПН | Edm.Boolean | true |
| ВключаетСО | Edm.Boolean | true |
| ВключаетООСМС | Edm.Boolean | true |
| ВключаетОПВР | Edm.Boolean | true |

## Related Entities

- [[Catalog_ФизическиеЛица]] — ФизЛицо
