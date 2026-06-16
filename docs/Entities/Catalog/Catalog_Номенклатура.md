---
category: Catalog
properties: 31
relations: 5
---

# Catalog_Номенклатура

**Category:** Catalog  
**Properties:** 31  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| Parent_Key | Edm.Guid | true |
| IsFolder | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| Артикул | Edm.String | true |
| БазоваяЕдиницаИзмерения_Key | Edm.Guid | true |
| ВидНДСПриИмпорте | Edm.String | true |
| ВидНоменклатуры_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| НаименованиеПолное | Edm.String | true |
| НоменклатурнаяГруппа_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Услуга | Edm.Boolean | true |
| СтавкаАкциза_Key | Edm.Guid | true |
| КодКПВЭД | Edm.String | true |
| КоэффициентРасчетаОблагаемойБазыАкциза | Edm.Double | true |
| ВидПодакцизногоТМЗ | Edm.String | true |
| КодТНВЭД | Edm.String | true |
| ИдентификаторТовараЭСФ | Edm.String | true |
| НаименованиеНаАнглийскомЯзыке | Edm.String | true |
| ОсобенностьУчета | Edm.String | true |
| Описание | Edm.String | true |
| КодНацКаталога | Edm.String | true |
| ВесНетто | Edm.Double | true |
| НаименованиеНацКаталог | Edm.String | true |
| ДополнительныеРеквизиты | Catalog_Номенклатура_ДополнительныеРеквизиты_RowType | true |

## Related Entities

- [[Catalog_ВидыНоменклатуры]] — ВидНоменклатуры
- [[Catalog_КлассификаторЕдиницИзмерения]] — БазоваяЕдиницаИзмерения
- [[Catalog_НоменклатурныеГруппы]] — НоменклатурнаяГруппа
- [[Catalog_СтавкиАкциза]] — СтавкаАкциза
- [[Catalog_СтавкиНДС]] — СтавкаНДС
