---
category: Document
properties: 15
relations: 5
---

# Document_ГТДИмпорт_Разделы

**Category:** Document  
**Properties:** 15  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СпособПроисхожденияТовара | Edm.String | true |
| ТаможеннаяСтоимость | Edm.Double | true |
| СтавкаПошлины | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаПошлины | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| ТаможенныйСбор | Edm.Double | true |
| ТаможенныйСборВал | Edm.Double | true |
| ДоговорВзаиморасчетовПошлина_Key | Edm.Guid | true |
| ДоговорВзаиморасчетовНДС_Key | Edm.Guid | true |
| ДоговорВзаиморасчетовСбор_Key | Edm.Guid | true |
| ДоговорВзаиморасчетовСборВал_Key | Edm.Guid | true |
| СуммаПошлиныСпец | Edm.Double | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорВзаиморасчетовНДС
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорВзаиморасчетовПошлина
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорВзаиморасчетовСбор
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорВзаиморасчетовСборВал
- [[Catalog_СтавкиНДС]] — СтавкаНДС
