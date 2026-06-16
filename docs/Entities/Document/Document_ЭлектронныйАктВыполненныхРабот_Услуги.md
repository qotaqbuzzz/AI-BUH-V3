---
category: Document
properties: 20
relations: 3
---

# Document_ЭлектронныйАктВыполненныхРабот_Услуги

**Category:** Document  
**Properties:** 20  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| УслугаНаименование | Edm.String | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| ЕдиницаИзмеренияКод | Edm.String | true |
| Количество | Edm.Double | true |
| Цена | Edm.Double | true |
| СтоимостьБезУчетаКосвенныхНалогов | Edm.Double | true |
| РазмерОборота | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СтоимостьСУчетомКосвенныхНалогов | Edm.Double | true |
| ДополнительныеСведения | Edm.String | true |
| СтавкаНДСЧисло | Edm.Int16 | true |
| БезНДС | Edm.Boolean | true |
| ЕдиницаИзмеренияНаименование | Edm.String | true |
| СоставнойКодГСВС | Edm.String | true |
| ДатаВыполнения | Edm.DateTime | true |
| НаименованиеУслугиВСистеме | Edm.String | true |

## Related Entities

- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
