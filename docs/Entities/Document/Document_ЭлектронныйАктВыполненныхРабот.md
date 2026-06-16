---
category: Document
properties: 61
relations: 5
---

# Document_ЭлектронныйАктВыполненныхРабот

**Category:** Document  
**Properties:** 61  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ДатаВыполненияРабот | Edm.DateTime | true |
| РегистрационныйНомер | Edm.String | true |
| БезДоговора | Edm.Boolean | true |
| Договор_Key | Edm.Guid | true |
| ДатаДоговора | Edm.DateTime | true |
| НомерДоговора | Edm.String | true |
| РегистрационныйНомерДоговора | Edm.String | true |
| Валюта_Key | Edm.Guid | true |
| КодВалюты | Edm.String | true |
| КурсВалюты | Edm.Double | true |
| АВРДополнительныеСведения | Edm.String | true |
| ИтогоСуммаНДС | Edm.Double | true |
| ИтогоСтоимостьСУчетомКосвенныхНалогов | Edm.Double | true |
| ИтогоСтоимостьБезУчетаКосвенныхНалогов | Edm.Double | true |
| ИтогоРазмерОборота | Edm.Double | true |
| ДокументОснование | Edm.String | true |
| ТипПодписи | Edm.String | true |
| Направление | Edm.String | true |
| Идентификатор | Edm.String | true |
| Статус | Edm.String | true |
| ЭЦП | Edm.String | true |
| ДатаПринятияСтатуса | Edm.DateTime | true |
| Состояние | Edm.String | true |
| УполномоченныйСотрудник | Edm.String | true |
| ДатаПодписи | Edm.DateTime | true |
| ЭЦППолучателя | Edm.String | true |
| УполномоченныйСотрудникПолучателя | Edm.String | true |
| ДатаПодписиПолучателя | Edm.DateTime | true |
| ТипПодписиПолучателя | Edm.String | true |
| ЭЦПОтправителя | Edm.String | true |
| ТипПодписиОтправителя | Edm.String | true |
| ДатаПодписиОтправителя | Edm.String | true |
| Причина | Edm.String | true |
| Автор_Key | Edm.Guid | true |
| Контрагент | Edm.String | true |
| ИнформацияПолучатель | Edm.String | true |
| ИнформацияОтправитель | Edm.String | true |
| ТипАВР | Edm.String | true |
| ДатаОсновногоАВР | Edm.DateTime | true |
| НомерОсновногоАВР | Edm.String | true |
| РегистрационныйНомерОсновногоАВР | Edm.String | true |
| ПереченьДокументации | Edm.String | true |
| ДополнительноеНаименование | Edm.String | true |
| ИспользованныеЗапасы | Edm.String | true |
| ДолжностьСдающего | Edm.String | true |
| ДолжностьПринимающего | Edm.String | true |
| СвязанныйАВР_Key | Edm.Guid | true |
| Поставщики | Document_ЭлектронныйАктВыполненныхРабот_Поставщики_RowType | true |
| Получатели | Document_ЭлектронныйАктВыполненныхРабот_Получатели_RowType | true |
| Услуги | Document_ЭлектронныйАктВыполненныхРабот_Услуги_RowType | true |
| Ошибки | Document_ЭлектронныйАктВыполненныхРабот_Ошибки_RowType | true |
| ДокументОснование_Type | Edm.String | true |
| Контрагент_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ДоговорыКонтрагентов]] — Договор
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
