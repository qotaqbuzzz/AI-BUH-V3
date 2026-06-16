---
category: Catalog
properties: 41
relations: 2
---

# Catalog_Файлы

**Category:** Catalog  
**Properties:** 41  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| Автор | Edm.String | true |
| ВладелецФайла_Key | Edm.Guid | true |
| ДатаЗаема | Edm.DateTime | true |
| ДатаМодификацииУниверсальная | Edm.DateTime | true |
| ДатаСоздания | Edm.DateTime | true |
| Зашифрован | Edm.Boolean | true |
| ИндексКартинки | Edm.Int64 | true |
| Описание | Edm.String | true |
| ПодписанЭП | Edm.Boolean | true |
| Редактирует | Edm.String | true |
| Служебный | Edm.Boolean | true |
| ТекстХранилище_Base64Data | Edm.Binary | true |
| ТекущаяВерсия_Key | Edm.Guid | true |
| Изменил | Edm.String | true |
| УдалитьТекущаяВерсияДатаМодификацииФайла | Edm.DateTime | true |
| УдалитьТекущаяВерсияДатаСоздания | Edm.DateTime | true |
| УдалитьТекущаяВерсияКод | Edm.String | true |
| УдалитьТекущаяВерсияНомерВерсии | Edm.Int64 | true |
| ПутьКФайлу | Edm.String | true |
| Размер | Edm.Int64 | true |
| Расширение | Edm.String | true |
| Том_Key | Edm.Guid | true |
| ХранитьВерсии | Edm.Boolean | true |
| ТипХраненияФайла | Edm.String | true |
| СтатусИзвлеченияТекста | Edm.String | true |
| ФайлХранилище_Base64Data | Edm.Binary | true |
| ДополнительныеРеквизиты | Catalog_Файлы_ДополнительныеРеквизиты_RowType | true |
| УдалитьСертификатыШифрования | Catalog_Файлы_УдалитьСертификатыШифрования_RowType | true |
| Автор_Type | Edm.String | true |
| Редактирует_Type | Edm.String | true |
| ТекстХранилище_Type | Edm.String | true |
| Изменил_Type | Edm.String | true |
| ФайлХранилище_Type | Edm.String | true |
| ТекстХранилище | Edm.Stream | true |
| ФайлХранилище | Edm.Stream | true |

## Related Entities

- [[Catalog_ВерсииФайлов]] — ТекущаяВерсия
- [[Catalog_ПапкиФайлов]] — ВладелецФайла
