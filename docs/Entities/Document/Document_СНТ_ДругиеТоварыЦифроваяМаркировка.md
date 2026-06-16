---
category: Document
properties: 41
relations: 6
---

# Document_СНТ_ДругиеТоварыЦифроваяМаркировка

**Category:** Document  
**Properties:** 41  
**Relations:** 6

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
| СтавкаАкциза_Key | Edm.Guid | true |
| СтавкаАкцизаЧисло | Edm.Double | true |
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
| ДополнительнаяИнформация | Edm.String | true |
| GTIN | Edm.String | true |
| УдалитьОблагаемыйИмпорт | Edm.Double | true |
| ОборотПоРеализации | Edm.Double | true |
| УдалитьКодМаркировки | Edm.String | true |
| УдалитьТипСредстваИдентификации | Edm.String | true |
| УдалитьТипУпаковки | Edm.String | true |
| ЕдиницаИзмеренияХраненияОстатков_Key | Edm.Guid | true |
| КоэффициентПересчета | Edm.Double | true |
| ТоварНаименованиеВРамкахТС | Edm.String | true |
| НомерСтрокиСНТ | Edm.Int16 | true |
| ИсточникПроисхожденияПолучатель_Key | Edm.Guid | true |
| ДополнительныйИдентификаторПолучатель | Edm.Int64 | true |
| НомерФНО | Edm.String | true |
| НомерПозицииИзФНО | Edm.String | true |
| ВесНетто | Edm.Double | true |
| Товар_Type | Edm.String | true |

## Related Entities

- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхождения
- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхожденияПолучатель
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмеренияХраненияОстатков
- [[Catalog_СтавкиАкциза]] — СтавкаАкциза
- [[Catalog_СтавкиНДС]] — СтавкаНДС
