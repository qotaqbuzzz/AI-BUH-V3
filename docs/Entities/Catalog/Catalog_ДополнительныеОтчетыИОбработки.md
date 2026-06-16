---
category: Catalog
properties: 34
relations: 1
---

# Catalog_ДополнительныеОтчетыИОбработки

**Category:** Catalog  
**Properties:** 34  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Parent_Key | Edm.Guid | true |
| IsFolder | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| БезопасныйРежим | Edm.Boolean | true |
| Версия | Edm.String | true |
| Вид | Edm.String | true |
| ИмяОбъекта | Edm.String | true |
| ИмяФайла | Edm.String | true |
| Информация | Edm.String | true |
| ИспользоватьДляФормыОбъекта | Edm.Boolean | true |
| ИспользоватьДляФормыСписка | Edm.Boolean | true |
| Комментарий | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| Публикация | Edm.String | true |
| ХранилищеНастроек_Base64Data | Edm.Binary | true |
| ХранилищеОбработки_Base64Data | Edm.Binary | true |
| ИспользуетХранилищеВариантов | Edm.Boolean | true |
| ТеснаяИнтеграцияСФормойОтчета | Edm.Boolean | true |
| РежимСовместимостиРазрешений | Edm.String | true |
| ВнешнийОбъектИспользовать | Edm.Int16 | true |
| Команды | Catalog_ДополнительныеОтчетыИОбработки_Команды_RowType | true |
| Назначение | Catalog_ДополнительныеОтчетыИОбработки_Назначение_RowType | true |
| Разделы | Catalog_ДополнительныеОтчетыИОбработки_Разделы_RowType | true |
| Разрешения | Catalog_ДополнительныеОтчетыИОбработки_Разрешения_RowType | true |
| ДополнительныеРеквизиты | Catalog_ДополнительныеОтчетыИОбработки_ДополнительныеРеквизиты_RowType | true |
| ХранилищеНастроек_Type | Edm.String | true |
| ХранилищеОбработки_Type | Edm.String | true |
| ХранилищеНастроек | Edm.Stream | true |
| ХранилищеОбработки | Edm.Stream | true |

## Related Entities

- [[Catalog_Пользователи]] — Ответственный
