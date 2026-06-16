---
category: Document
properties: 12
relations: 1
---

# Document_СопоставлениеСНТиФНО_ТоварыФНО

**Category:** Document  
**Properties:** 12  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Товар | Edm.String | true |
| ТоварНаименование | Edm.String | true |
| КодТНВЭД | Edm.String | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| ЕдиницаИзмеренияКод | Edm.String | true |
| Количество | Edm.Double | true |
| Цена | Edm.Double | true |
| НомерРазделаФНО | Edm.Int16 | true |
| НомерПозицииВЗаявлении | Edm.Int64 | true |
| Товар_Type | Edm.String | true |

## Related Entities

- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
