---
category: Catalog
properties: 37
relations: 11
---

# Catalog_Организации

**Category:** Catalog  
**Properties:** 37  
**Relations:** 11

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| ГоловнаяОрганизация_Key | Edm.Guid | true |
| ДатаПостановкиНаУчетПоНДС | Edm.DateTime | true |
| ДатаРегистрации | Edm.DateTime | true |
| ДатаСвидетельстваПоНДС | Edm.DateTime | true |
| ИдентификационныйНомер | Edm.String | true |
| ИндивидуальныйПредприниматель_Key | Edm.Guid | true |
| ИностраннаяОрганизация | Edm.Boolean | true |
| КБЕ | Edm.String | true |
| КодВСтранеРегистрации | Edm.String | true |
| КодПоОКПО | Edm.String | true |
| УдалитьЛоготип_Key | Edm.Guid | true |
| НаименованиеИнострОрганизации | Edm.String | true |
| НаименованиеПолное | Edm.String | true |
| НалоговыйКомитет_Key | Edm.Guid | true |
| НомерСвидетельстваПоНДС | Edm.String | true |
| ОсновнаяКасса_Key | Edm.Guid | true |
| ОсновнойБанковскийСчет_Key | Edm.Guid | true |
| ОсновнойВидДеятельности_Key | Edm.Guid | true |
| Префикс | Edm.String | true |
| РНН | Edm.String | true |
| СерияСвидетельстваПоНДС | Edm.String | true |
| СтранаПостоянногоМестонахождения_Key | Edm.Guid | true |
| СтранаРегистрации_Key | Edm.Guid | true |
| ЮрФизЛицо | Edm.String | true |
| УказыватьРеквизитыГоловнойОрганизацииВСчетеФактуре | Edm.Boolean | true |
| ФайлЛоготипа_Key | Edm.Guid | true |
| МестныйБюджет_Key | Edm.Guid | true |
| УчетПоМестнымБюджетам | Edm.Boolean | true |
| ФайлПечати_Key | Edm.Guid | true |
| ДополнительныеРеквизиты | Catalog_Организации_ДополнительныеРеквизиты_RowType | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — ОсновнойБанковскийСчет
- [[Catalog_ВидыДеятельности]] — ОсновнойВидДеятельности
- [[Catalog_Кассы]] — ОсновнаяКасса
- [[Catalog_КлассификаторСтранМира]] — СтранаПостоянногоМестонахождения
- [[Catalog_КлассификаторСтранМира]] — СтранаРегистрации
- [[Catalog_Контрагенты]] — МестныйБюджет
- [[Catalog_Контрагенты]] — НалоговыйКомитет
- [[Catalog_ОрганизацииПрисоединенныеФайлы]] — ФайлЛоготипа
- [[Catalog_ОрганизацииПрисоединенныеФайлы]] — ФайлПечати
- [[Catalog_УдалитьХранилищеДополнительнойИнформации]] — УдалитьЛоготип
- [[Catalog_ФизическиеЛица]] — ИндивидуальныйПредприниматель
