---
category: Document
properties: 37
relations: 5
---

# Document_ЭлектронныйДокументВС_ТоварыВС

**Category:** Document  
**Properties:** 37  
**Relations:** 5

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
| ИсточникПроисхождения_Key | Edm.Guid | true |
| ТипПроисхождения | Edm.String | true |
| СтранаПроисхожденияТовара_Key | Edm.Guid | true |
| ДополнительныйИдентификатор | Edm.Int64 | true |
| ИсточникПроисхожденияПолучатель_Key | Edm.Guid | true |
| ДополнительныйИдентификаторПолучатель | Edm.Int64 | true |
| GTIN | Edm.String | true |
| СпособВыписки | Edm.String | true |
| ДокументРегистратор | Edm.String | true |
| РасходноеДвижениеКорректировки | Edm.Boolean | true |
| КоличествоРезерв | Edm.Double | true |
| ПризнакУчетаНаВиртуальномСкладе | Edm.Boolean | true |
| Товар_Type | Edm.String | true |
| ДокументРегистратор_Type | Edm.String | true |

## Related Entities

- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхождения
- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхожденияПолучатель
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_КлассификаторСтранМира]] — СтранаПроисхожденияТовара
- [[Catalog_НоменклатураГСВС]] — ГСВС
