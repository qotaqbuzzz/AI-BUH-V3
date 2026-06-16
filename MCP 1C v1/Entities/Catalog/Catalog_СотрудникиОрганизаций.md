---
category: Catalog
properties: 31
relations: 9
---

# Catalog_СотрудникиОрганизаций

**Category:** Catalog  
**Properties:** 31  
**Relations:** 9

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
| Организация_Key | Edm.Guid | true |
| СтруктурнаяЕдиница_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Физлицо_Key | Edm.Guid | true |
| Актуальность | Edm.Boolean | true |
| ВидЗанятости | Edm.String | true |
| ПостфиксНаименования | Edm.String | true |
| ТекущаяСтруктурнаяЕдиница_Key | Edm.Guid | true |
| ТекущееСтруктурноеПодразделение_Key | Edm.Guid | true |
| ТекущееПодразделениеОрганизации_Key | Edm.Guid | true |
| ТекущаяДолжностьОрганизации_Key | Edm.Guid | true |
| ДатаПриемаНаРаботу | Edm.DateTime | true |
| ДатаУвольнения | Edm.DateTime | true |
| EmpID | Edm.String | true |
| КодКомпании | Edm.String | true |
| НаименованиеКомпании | Edm.String | true |
| ЦентрЗатрат | Edm.String | true |
| ЭлПочта | Edm.String | true |
| Локация | Edm.String | true |
| Страна_Key | Edm.Guid | true |
| ДополнительныеРеквизиты | Catalog_СотрудникиОрганизаций_ДополнительныеРеквизиты_RowType | true |
| НаборыЗначенийДоступа | Catalog_СотрудникиОрганизаций_НаборыЗначенийДоступа_RowType | true |

## Related Entities

- [[Catalog_ДолжностиОрганизаций]] — ТекущаяДолжностьОрганизации
- [[Catalog_КлассификаторСтранМира]] — Страна
- [[Catalog_Организации]] — Организация
- [[Catalog_Организации]] — СтруктурнаяЕдиница
- [[Catalog_Организации]] — ТекущаяСтруктурнаяЕдиница
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_ПодразделенияОрганизаций]] — ТекущееПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — ТекущееСтруктурноеПодразделение
- [[Catalog_ФизическиеЛица]] — Физлицо
