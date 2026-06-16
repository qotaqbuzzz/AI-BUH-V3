---
category: InformationRegister
properties: 23
relations: 1
---

# InformationRegister_ЭлектронныеПодписи

**Category:** InformationRegister  
**Properties:** 23  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| ПодписанныйОбъект | Edm.String | false |
| ПорядковыйНомер | Edm.Int64 | false |
| ТребуетсяПроверка | Edm.Boolean | true |
| ТипПодписи | Edm.String | true |
| СрокДействияПоследнейМеткиВремени | Edm.DateTime | true |
| ДатаПроверкиПодписи | Edm.DateTime | true |
| ИмяФайлаПодписи | Edm.String | true |
| Комментарий | Edm.String | true |
| КомуВыданСертификат | Edm.String | true |
| Отпечаток | Edm.String | true |
| Подпись_Base64Data | Edm.Binary | true |
| ПодписьВерна | Edm.Boolean | true |
| Сертификат_Base64Data | Edm.Binary | true |
| ДатаПодписи | Edm.DateTime | true |
| УстановившийПодпись_Key | Edm.Guid | true |
| ОшибкаПриАвтоматическомПродлении | Edm.Boolean | true |
| ПропуститьПриПродлении | Edm.Boolean | true |
| ИдентификаторПодписи | Edm.Guid | true |
| ПодписанныйОбъект_Type | Edm.String | false |
| Подпись_Type | Edm.String | true |
| Сертификат_Type | Edm.String | true |
| Подпись | Edm.Stream | true |
| Сертификат | Edm.Stream | true |

## Related Entities

- [[Catalog_Пользователи]] — УстановившийПодпись
