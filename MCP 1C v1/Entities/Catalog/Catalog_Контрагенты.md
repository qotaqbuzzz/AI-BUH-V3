---
category: Catalog
properties: 34
relations: 5
---

# Catalog_Контрагенты

**Category:** Catalog  
**Properties:** 34  
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
| ГоловнойКонтрагент_Key | Edm.Guid | true |
| ДатаСвидетельстваПоНДС | Edm.DateTime | true |
| ДокументУдостоверяющийЛичность | Edm.String | true |
| ИдентификационныйКодЛичности | Edm.String | true |
| ИндивидуальныйПредпринимательАдвокатЧастныйНотариус | Edm.Boolean | true |
| КБЕ | Edm.String | true |
| КодПоОКПО | Edm.String | true |
| Комментарий | Edm.String | true |
| НаименованиеПолное | Edm.String | true |
| НомерНалоговойРегистрацииВСтранеРезидентства | Edm.String | true |
| НомерСвидетельстваПоНДС | Edm.String | true |
| ОсновноеКонтактноеЛицо_Key | Edm.Guid | true |
| ОсновнойБанковскийСчет_Key | Edm.Guid | true |
| ОсновнойДоговорКонтрагента_Key | Edm.Guid | true |
| РНН | Edm.String | true |
| СерияСвидетельстваПоНДС | Edm.String | true |
| СИК | Edm.String | true |
| СтранаРезидентства_Key | Edm.Guid | true |
| ФизЛицо_Key | Edm.Guid | true |
| ЮрФизЛицо | Edm.String | true |
| УказыватьРеквизитыГоловнойОрганизацииВСчетеФактуре | Edm.Boolean | true |
| ГосударственноеУчреждение | Edm.Boolean | true |
| МалаяТорговаяТочка | Edm.Boolean | true |
| КодОрганаГосударственныхДоходов | Edm.String | true |
| ДополнительныеРеквизиты | Catalog_Контрагенты_ДополнительныеРеквизиты_RowType | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — ОсновнойБанковскийСчет
- [[Catalog_ДоговорыКонтрагентов]] — ОсновнойДоговорКонтрагента
- [[Catalog_КлассификаторСтранМира]] — СтранаРезидентства
- [[Catalog_КонтактныеЛица]] — ОсновноеКонтактноеЛицо
- [[Catalog_ФизическиеЛица]] — ФизЛицо
