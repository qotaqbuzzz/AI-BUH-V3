---
category: Catalog
properties: 14
relations: 1
---

# Catalog_ПеремещениеТоваровПрисоединенныеФайлы_УдалитьЭлектронныеПодписи

**Category:** Catalog  
**Properties:** 14  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ДатаПодписи | Edm.DateTime | true |
| ИмяФайлаПодписи | Edm.String | true |
| Комментарий | Edm.String | true |
| КомуВыданСертификат | Edm.String | true |
| Отпечаток | Edm.String | true |
| Подпись_Base64Data | Edm.Binary | true |
| УстановившийПодпись_Key | Edm.Guid | true |
| Сертификат_Base64Data | Edm.Binary | true |
| Подпись_Type | Edm.String | true |
| Сертификат_Type | Edm.String | true |
| Подпись | Edm.Stream | true |
| Сертификат | Edm.Stream | true |

## Related Entities

- [[Catalog_Пользователи]] — УстановившийПодпись
