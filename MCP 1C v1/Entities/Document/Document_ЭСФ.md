---
category: Document
properties: 88
relations: 9
---

# Document_ЭСФ

**Category:** Document  
**Properties:** 88  
**Relations:** 9

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Идентификатор | Edm.String | true |
| РегистрационныйНомер | Edm.String | true |
| Направление | Edm.String | true |
| Статус | Edm.String | true |
| Состояние | Edm.String | true |
| ПользовательскийСтатус | Edm.String | true |
| УполномоченныйСотрудник | Edm.String | true |
| Автор_Key | Edm.Guid | true |
| ДополнительныеСведения | Edm.String | true |
| ДатаОборота | Edm.DateTime | true |
| Вид | Edm.String | true |
| СвязанныйЭСФ_Key | Edm.Guid | true |
| СвязанныйЭСФДата | Edm.DateTime | true |
| СвязанныйЭСФНомер | Edm.String | true |
| СвязанныйЭСФРегистрационныйНомер | Edm.String | true |
| ГрузоотправительИдентификатор | Edm.String | true |
| ГрузоотправительНаименование | Edm.String | true |
| Грузоотправитель | Edm.String | true |
| АдресОтправки | Edm.String | true |
| ГрузополучательИдентификатор | Edm.String | true |
| ГрузополучательНаименование | Edm.String | true |
| Грузополучатель | Edm.String | true |
| АдресДоставки | Edm.String | true |
| ДоговорПоставкиНомер | Edm.String | true |
| ДоговорПоставкиДата | Edm.DateTime | true |
| ДоговорПоставкиУсловияОплаты | Edm.String | true |
| ДоговорПоставкиСпособОтправления | Edm.String | true |
| ДоговорПоставки_Key | Edm.Guid | true |
| ДоверенностьНаПоставкуНомер | Edm.String | true |
| ДоверенностьНаПоставкуДата | Edm.DateTime | true |
| ПунктНазначения | Edm.String | true |
| ГосучреждениеИИК | Edm.String | true |
| ГосучреждениеКодТоваров | Edm.String | true |
| ГосучреждениеНазначениеПлатежа | Edm.String | true |
| ГосучреждениеБИК | Edm.String | true |
| ВалютаКод | Edm.String | true |
| Валюта_Key | Edm.Guid | true |
| КурсВалюты | Edm.Double | true |
| ТипПодписи | Edm.String | true |
| ЭЦП | Edm.String | true |
| Причина | Edm.String | true |
| ФайлЭСФ_Key | Edm.Guid | true |
| Контрагент_Key | Edm.Guid | true |
| СуммаДокумента | Edm.Double | true |
| СчетФактура | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| ДатаВыпискиНаБумажномНосителе | Edm.DateTime | true |
| ГрузополучательКодСтраны | Edm.String | true |
| СпособОтправленияПоКлассификатору | Edm.String | true |
| ДоговорПоставкиУсловияПоставки | Edm.String | true |
| ПоверенныйПоставщикаБИН | Edm.String | true |
| ПоверенныйПоставщикаНаименование | Edm.String | true |
| ПоверенныйПоставщикаАдресМестонахождения | Edm.String | true |
| ДоговорПорученияПоставщикаНомер | Edm.String | true |
| ДоговорПорученияПоставщикаДата | Edm.DateTime | true |
| ПоверенныйПокупателяБИН | Edm.String | true |
| ПоверенныйПокупателяНаименование | Edm.String | true |
| ПоверенныйПокупателяАдресМестонахождения | Edm.String | true |
| ДоговорПорученияПокупателяНомер | Edm.String | true |
| ДоговорПорученияПокупателяДата | Edm.DateTime | true |
| ВерсияБланкаЭСФ | Edm.Int16 | true |
| ДокументПодтверждающийПоставкуНомер | Edm.String | true |
| ДокументПодтверждающийПоставкуДата | Edm.DateTime | true |
| ПричинаВыпискиНаБумажномНосителе | Edm.String | true |
| Склад_Key | Edm.Guid | true |
| ОтражаетсяВВС | Edm.Boolean | true |
| МестоРеализацииНеРК | Edm.Boolean | true |
| СНТ_Key | Edm.Guid | true |
| ДокументПодтверждающийПоставкуАВРДата | Edm.DateTime | true |
| ДокументПодтверждающийПоставкуАВРНомер | Edm.String | true |
| УникальныйНомерВалютногоКонтроля | Edm.String | true |
| Поставщики | Document_ЭСФ_Поставщики_RowType | true |
| Получатели | Document_ЭСФ_Получатели_RowType | true |
| Товары | Document_ЭСФ_Товары_RowType | true |
| Ошибки | Document_ЭСФ_Ошибки_RowType | true |
| ТоварыПоПоставщикам | Document_ЭСФ_ТоварыПоПоставщикам_RowType | true |
| ТоварыПоПолучателям | Document_ЭСФ_ТоварыПоПолучателям_RowType | true |
| Грузоотправитель_Type | Edm.String | true |
| Грузополучатель_Type | Edm.String | true |
| СчетФактура_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВиртуальныеСклады]] — Склад
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорПоставки
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_ЭСФПрисоединенныеФайлы]] — ФайлЭСФ
- [[Document_СНТ]] — СНТ
