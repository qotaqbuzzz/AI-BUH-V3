---
category: Document
properties: 30
relations: 4
---

# Document_ЭлектронныйДокументВС_ИсходныеТоварыВС

**Category:** Document  
**Properties:** 30  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ТоварНаименование | Edm.String | true |
| Товар | Edm.String | true |
| СоставнойКодГСВС | Edm.String | true |
| ФизическаяМетка | Edm.String | true |
| КодТНВЭД | Edm.String | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Цена | Edm.Double | true |
| ВозможенЭкспорт | Edm.Boolean | true |
| ТипПошлины | Edm.String | true |
| СтранаПроисхожденияТовараКод | Edm.String | true |
| НомерЗаявленияВРамкахТС | Edm.String | true |
| ДатаСертификатаПроисхождения | Edm.DateTime | true |
| ПризнакПроисхождения | Edm.String | true |
| ТоварНаименованиеВРамкахТС | Edm.String | true |
| НомерПозицииВДекларацииИлиЗаявлении | Edm.String | true |
| Крепость | Edm.Double | true |
| ПинКод | Edm.String | true |
| ЕдиницаИзмеренияКод | Edm.String | true |
| Сумма | Edm.Double | true |
| ГСВС_Key | Edm.Guid | true |
| УдалитьКодКПВЭД | Edm.String | true |
| ИсточникПроисхождения_Key | Edm.Guid | true |
| ТипПроисхождения | Edm.String | true |
| СтранаПроисхожденияТовара_Key | Edm.Guid | true |
| ДополнительныйИдентификатор | Edm.Int64 | true |
| GTIN | Edm.String | true |
| Товар_Type | Edm.String | true |

## Related Entities

- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхождения
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_КлассификаторСтранМира]] — СтранаПроисхожденияТовара
- [[Catalog_НоменклатураГСВС]] — ГСВС
