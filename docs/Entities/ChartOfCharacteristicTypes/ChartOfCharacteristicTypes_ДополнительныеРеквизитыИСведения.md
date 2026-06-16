---
category: ChartOfCharacteristicTypes
properties: 37
relations: 1
---

# ChartOfCharacteristicTypes_ДополнительныеРеквизитыИСведения

**Category:** ChartOfCharacteristicTypes  
**Properties:** 37  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| ValueType | TypeDescription | true |
| Виден | Edm.Boolean | true |
| ВладелецДополнительныхЗначений_Key | Edm.Guid | true |
| ВыводитьВВидеГиперссылки | Edm.Boolean | true |
| ДополнительныеЗначенияИспользуются | Edm.Boolean | true |
| ДополнительныеЗначенияСВесом | Edm.Boolean | true |
| Доступен | Edm.Boolean | true |
| Заголовок | Edm.String | true |
| ЗаголовокФормыВыбораЗначения | Edm.String | true |
| ЗаголовокФормыВыбораЗначенияЯзык1 | Edm.String | true |
| ЗаголовокФормыВыбораЗначенияЯзык2 | Edm.String | true |
| ЗаголовокФормыЗначения | Edm.String | true |
| ЗаголовокФормыЗначенияЯзык1 | Edm.String | true |
| ЗаголовокФормыЗначенияЯзык2 | Edm.String | true |
| ЗаголовокЯзык1 | Edm.String | true |
| ЗаголовокЯзык2 | Edm.String | true |
| ЗаполнятьОбязательно | Edm.Boolean | true |
| ИдентификаторДляФормул | Edm.String | true |
| Имя | Edm.String | true |
| Комментарий | Edm.String | true |
| МногострочноеПолеВвода | Edm.Int16 | true |
| НаборСвойств_Key | Edm.Guid | true |
| Подсказка | Edm.String | true |
| ПодсказкаЯзык1 | Edm.String | true |
| ПодсказкаЯзык2 | Edm.String | true |
| ФорматСвойства | Edm.String | true |
| ЭтоДополнительноеСведение | Edm.Boolean | true |
| ВидСвойств | Edm.String | true |
| ЦветСвойств | Edm.String | true |
| ЗависимостиДополнительныхРеквизитов | ChartOfCharacteristicTypes_ДополнительныеРеквизитыИСведения_ЗависимостиДополнительныхРеквизитов_RowType | true |
| Представления | ChartOfCharacteristicTypes_ДополнительныеРеквизитыИСведения_Представления_RowType | true |

## Related Entities

- [[Catalog_НаборыДополнительныхРеквизитовИСведений]] — НаборСвойств
