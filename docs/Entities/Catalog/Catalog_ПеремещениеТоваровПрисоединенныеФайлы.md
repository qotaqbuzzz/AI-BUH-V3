---
category: Catalog
properties: 32
relations: 4
---

# Catalog_ПеремещениеТоваровПрисоединенныеФайлы

**Category:** Catalog  
**Properties:** 32  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| ВладелецФайла_Key | Edm.Guid | true |
| ДатаМодификацииУниверсальная | Edm.DateTime | true |
| ДатаСоздания | Edm.DateTime | true |
| Зашифрован | Edm.Boolean | true |
| Изменил_Key | Edm.Guid | true |
| ИндексКартинки | Edm.Int64 | true |
| Описание | Edm.String | true |
| ПодписанЭП | Edm.Boolean | true |
| ПутьКФайлу | Edm.String | true |
| Размер | Edm.Int64 | true |
| Расширение | Edm.String | true |
| Редактирует_Key | Edm.Guid | true |
| СтатусИзвлеченияТекста | Edm.String | true |
| ТекстХранилище_Base64Data | Edm.Binary | true |
| ТипХраненияФайла | Edm.String | true |
| Том_Key | Edm.Guid | true |
| ФайлХранилище_Base64Data | Edm.Binary | true |
| ХранитьВерсии | Edm.Boolean | true |
| ДатаЗаема | Edm.DateTime | true |
| УдалитьЭлектронныеПодписи | Catalog_ПеремещениеТоваровПрисоединенныеФайлы_УдалитьЭлектронныеПодписи_RowType | true |
| УдалитьСертификатыШифрования | Catalog_ПеремещениеТоваровПрисоединенныеФайлы_УдалитьСертификатыШифрования_RowType | true |
| ТекстХранилище_Type | Edm.String | true |
| ФайлХранилище_Type | Edm.String | true |
| ТекстХранилище | Edm.Stream | true |
| ФайлХранилище | Edm.Stream | true |

## Related Entities

- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Изменил
- [[Catalog_Пользователи]] — Редактирует
- [[Document_ПеремещениеТоваров]] — ВладелецФайла
