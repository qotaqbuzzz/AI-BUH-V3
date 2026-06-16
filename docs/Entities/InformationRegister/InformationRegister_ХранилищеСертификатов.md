---
category: InformationRegister
properties: 10
relations: 0
---

# InformationRegister_ХранилищеСертификатов

**Category:** InformationRegister  
**Properties:** 10  
**Relations:** 0

## Properties

| Name | Type | Nullable |
|------|------|----------|
| ТипХранилища | Edm.String | false |
| Идентификатор | Edm.String | false |
| Наименование | Edm.String | true |
| ДатаНачала | Edm.DateTime | true |
| ДатаОкончания | Edm.DateTime | true |
| Отпечаток | Edm.String | true |
| СерийныйНомер | Edm.String | true |
| Сертификат_Base64Data | Edm.Binary | true |
| Сертификат_Type | Edm.String | true |
| Сертификат | Edm.Stream | true |
