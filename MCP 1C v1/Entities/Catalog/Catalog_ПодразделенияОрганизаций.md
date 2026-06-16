---
category: Catalog
properties: 22
relations: 6
---

# Catalog_ПодразделенияОрганизаций

**Category:** Catalog  
**Properties:** 22  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| Owner_Key | Edm.Guid | true |
| Parent_Key | Edm.Guid | true |
| DeletionMark | Edm.Boolean | true |
| ИдентификационныйНомер | Edm.String | true |
| КодПоОКПО | Edm.String | true |
| НаименованиеПолное | Edm.String | true |
| НалоговыйКомитет_Key | Edm.Guid | true |
| ОсновнаяКасса_Key | Edm.Guid | true |
| ОсновнойБанковскийСчет_Key | Edm.Guid | true |
| ОсновнойВидДеятельности_Key | Edm.Guid | true |
| РНН | Edm.String | true |
| УказыватьРеквизитыГоловнойОрганизации | Edm.Boolean | true |
| ЯвляетсяСтруктурнымПодразделением | Edm.Boolean | true |
| МестныйБюджет_Key | Edm.Guid | true |
| УчетПоМестнымБюджетам | Edm.Boolean | true |
| ДополнительныеРеквизиты | Catalog_ПодразделенияОрганизаций_ДополнительныеРеквизиты_RowType | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — ОсновнойБанковскийСчет
- [[Catalog_ВидыДеятельности]] — ОсновнойВидДеятельности
- [[Catalog_Кассы]] — ОсновнаяКасса
- [[Catalog_Контрагенты]] — МестныйБюджет
- [[Catalog_Контрагенты]] — НалоговыйКомитет
- [[Catalog_Организации]] — Owner
