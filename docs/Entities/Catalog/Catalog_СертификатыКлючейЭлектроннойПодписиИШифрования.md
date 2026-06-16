---
category: Catalog
properties: 29
relations: 5
---

# Catalog_СертификатыКлючейЭлектроннойПодписиИШифрования

**Category:** Catalog  
**Properties:** 29  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| КомуВыдан | Edm.String | true |
| Фирма | Edm.String | true |
| Имя | Edm.String | true |
| Отчество | Edm.String | true |
| Должность | Edm.String | true |
| КемВыдан | Edm.String | true |
| ДействителенДо | Edm.DateTime | true |
| Подписание | Edm.Boolean | true |
| Шифрование | Edm.Boolean | true |
| Отпечаток | Edm.String | true |
| ДанныеСертификата_Base64Data | Edm.Binary | true |
| Программа_Key | Edm.Guid | true |
| Отозван | Edm.Boolean | true |
| ВводитьПарольВПрограммеЭлектроннойПодписи | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| ФизическоеЛицо_Key | Edm.Guid | true |
| Пользователь_Key | Edm.Guid | true |
| Добавил_Key | Edm.Guid | true |
| Фамилия | Edm.String | true |
| УдалитьПользовательОповещенОСрокеДействия | Edm.Boolean | true |
| Пользователи | Catalog_СертификатыКлючейЭлектроннойПодписиИШифрования_Пользователи_RowType | true |
| ДанныеСертификата_Type | Edm.String | true |
| ДанныеСертификата | Edm.Stream | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_Пользователи]] — Добавил
- [[Catalog_Пользователи]] — Пользователь
- [[Catalog_ПрограммыЭлектроннойПодписиИШифрования]] — Программа
- [[Catalog_ФизическиеЛица]] — ФизическоеЛицо
