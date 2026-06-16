---
category: Document
properties: 38
relations: 7
---

# Document_ЭСФ_Товары

**Category:** Document  
**Properties:** 38  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ТоварНаименование | Edm.String | true |
| Товар | Edm.String | true |
| КодТНВЭД | Edm.String | true |
| ЕдиницаИзмеренияНаименование | Edm.String | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Цена | Edm.Double | true |
| СуммаБезНалогов | Edm.Double | true |
| СтавкаАкцизаЧисло | Edm.Double | true |
| СтавкаАкциза_Key | Edm.Guid | true |
| СуммаАкциза | Edm.Double | true |
| ОборотПоРеализации | Edm.Double | true |
| СтавкаНДСЧисло | Edm.Int16 | true |
| БезНДС | Edm.Boolean | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| Сумма | Edm.Double | true |
| НомерЗаявленияВРамкахТС | Edm.String | true |
| НомерГТД_Key | Edm.Guid | true |
| ДополнительныеДанные | Edm.String | true |
| ПризнакПроисхождения | Edm.String | true |
| ТоварНаименованиеВРамкахТС | Edm.String | true |
| НомерПозицииВДекларацииИлиЗаявлении | Edm.String | true |
| ИдентификаторТовара | Edm.String | true |
| ЕдиницаИзмеренияКод | Edm.String | true |
| ИсточникПроисхождения_Key | Edm.Guid | true |
| ЕдиницаИзмеренияХраненияОстатков_Key | Edm.Guid | true |
| КоэффициентПересчета | Edm.Double | true |
| ДополнительныйИдентификатор | Edm.Int64 | true |
| ПризнакУчетаНаВиртуальномСкладе | Edm.Boolean | true |
| НомерИзСНТ | Edm.String | true |
| КоличественнаяЕдИзм_Key | Edm.Guid | true |
| КоличественнаяЕдИзмКод | Edm.String | true |
| КоличествоВКоличественнойЕдИзм | Edm.Double | true |
| GTIN | Edm.String | true |
| Товар_Type | Edm.String | true |

## Related Entities

- [[Catalog_ИсточникиПроисхождения]] — ИсточникПроисхождения
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмеренияХраненияОстатков
- [[Catalog_КлассификаторЕдиницИзмерения]] — КоличественнаяЕдИзм
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_СтавкиАкциза]] — СтавкаАкциза
- [[Catalog_СтавкиНДС]] — СтавкаНДС
