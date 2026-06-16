---
category: Document
properties: 19
relations: 4
---

# Document_СопоставлениеСНТиФНО_ТоварыСНТ

**Category:** Document  
**Properties:** 19  
**Relations:** 4

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
| НомерРазделаСНТ | Edm.Int16 | true |
| НомерЗаявленияВРамкахТС | Edm.String | true |
| НомерПозицииВЗаявлении | Edm.Int64 | true |
| НомерСтрокиВСНТ | Edm.String | true |
| Склад_Key | Edm.Guid | true |
| ИсточникПроисхождения_Key | Edm.Guid | true |
| ИсточникПроисхожденияПолучатель_Key | Edm.Guid | true |
| КоличествоОстатков | Edm.Double | true |
| ТоварНаименованиеВРамкахТС | Edm.String | true |
| Товар_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВиртуальныеСклады]] — Склад
- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхождения
- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхожденияПолучатель
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
