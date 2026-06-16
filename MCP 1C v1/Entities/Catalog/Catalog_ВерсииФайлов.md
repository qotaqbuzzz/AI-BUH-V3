---
category: Catalog
properties: 31
relations: 1
---

# Catalog_ВерсииФайлов

**Category:** Catalog  
**Properties:** 31  
**Relations:** 1

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
| DeletionMark | Edm.Boolean | true |
| Автор | Edm.String | true |
| ДатаМодификацииУниверсальная | Edm.DateTime | true |
| ДатаМодификацииФайла | Edm.DateTime | true |
| ДатаСоздания | Edm.DateTime | true |
| ИндексКартинки | Edm.Int64 | true |
| Комментарий | Edm.String | true |
| НомерВерсии | Edm.Int64 | true |
| УдалитьПолноеНаименование | Edm.String | true |
| ПутьКФайлу | Edm.String | true |
| Размер | Edm.Int64 | true |
| Расширение | Edm.String | true |
| РодительскаяВерсия_Key | Edm.Guid | true |
| СтатусИзвлеченияТекста | Edm.String | true |
| ТекстХранилище_Base64Data | Edm.Binary | true |
| ТипХраненияФайла | Edm.String | true |
| Том_Key | Edm.Guid | true |
| ФайлХранилище_Base64Data | Edm.Binary | true |
| УдалитьЭлектронныеПодписи | Catalog_ВерсииФайлов_УдалитьЭлектронныеПодписи_RowType | true |
| Автор_Type | Edm.String | true |
| ТекстХранилище_Type | Edm.String | true |
| ФайлХранилище_Type | Edm.String | true |
| ТекстХранилище | Edm.Stream | true |
| ФайлХранилище | Edm.Stream | true |

## Related Entities

- [[Catalog_Файлы]] — Owner
