---
category: Document
properties: 30
relations: 5
---

# Document_СНТ_Товары

**Category:** Document  
**Properties:** 30  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Товар | Edm.String | true |
| ТоварНаименование | Edm.String | true |
| ПризнакПроисхождения | Edm.String | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| КодТНВЭД | Edm.String | true |
| Цена | Edm.Double | true |
| СуммаБезНалогов | Edm.Double | true |
| СтавкаАкцизаЧисло | Edm.Double | true |
| СтавкаАкциза_Key | Edm.Guid | true |
| СуммаАкциза | Edm.Double | true |
| СтавкаНДСЧисло | Edm.Int16 | true |
| БезНДС | Edm.Boolean | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| Сумма | Edm.Double | true |
| НомерЗаявленияВРамкахТС | Edm.String | true |
| НомерПозицииВДекларацииИлиЗаявлении | Edm.String | true |
| ИдентификаторТовара | Edm.String | true |
| ЕдиницаИзмеренияКод | Edm.String | true |
| ИсточникПроисхождения_Key | Edm.Guid | true |
| ДополнительныйИдентификатор | Edm.Int64 | true |
| ОборотПоРеализации | Edm.Double | true |
| УдалитьОблагаемыйИмпорт | Edm.Double | true |
| ТоварНаименованиеВРамкахТС | Edm.String | true |
| ИсточникПроисхожденияПолучатель_Key | Edm.Guid | true |
| ВесНетто | Edm.Double | true |
| Товар_Type | Edm.String | true |

## Related Entities

- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхождения
- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхожденияПолучатель
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_СтавкиАкциза]] — СтавкаАкциза
- [[Catalog_СтавкиНДС]] — СтавкаНДС
