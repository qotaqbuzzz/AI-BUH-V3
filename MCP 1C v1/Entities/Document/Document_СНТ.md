---
category: Document
properties: 230
relations: 8
---

# Document_СНТ

**Category:** Document  
**Properties:** 230  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| ТипСНТ | Edm.String | true |
| НомерСНТ | Edm.String | true |
| ДатаОтгрузкиТовара | Edm.DateTime | true |
| Направление | Edm.String | true |
| СвязанныйСНТ_Key | Edm.Guid | true |
| РегистрационныйНомерСвязанногоСНТ | Edm.String | true |
| ВидОперации | Edm.String | true |
| ВидВвоза | Edm.String | true |
| ВидВывоза | Edm.String | true |
| ВидПеремещения | Edm.String | true |
| ЕстьЭтиловыйСпирт | Edm.Boolean | true |
| ЕстьВиноматериал | Edm.Boolean | true |
| ЕстьПивоПивныеНапитки | Edm.Boolean | true |
| ЕстьАлкоголь | Edm.Boolean | true |
| ЕстьНефтепродукты | Edm.Boolean | true |
| ЕстьБиотопливо | Edm.Boolean | true |
| ЕстьТабачныеИзделия | Edm.Boolean | true |
| ЕстьДругиеТоварыЦифроваяМаркировка | Edm.Boolean | true |
| ЕстьТоварыЭК | Edm.Boolean | true |
| Валюта_Key | Edm.Guid | true |
| ВалютаКод | Edm.String | true |
| КурсВалюты | Edm.Double | true |
| РегистрационныйНомерИСЭСФ | Edm.String | true |
| ДатаРегистрацииИСЭСФ | Edm.DateTime | true |
| РегистрационныйНомерИСМПТ | Edm.String | true |
| ДатаРегистрацииИСМПТ | Edm.DateTime | true |
| Поставщик | Edm.String | true |
| ПоставщикИдентификатор | Edm.String | true |
| ПоставщикНерезидент | Edm.Boolean | true |
| ПоставщикНаименование | Edm.String | true |
| ПоставщикБИНСтруктурногоПодразделения | Edm.String | true |
| ПоставщикБИНРеорганизованногоЛица | Edm.String | true |
| ПоставщикКодСтраны | Edm.String | true |
| ПоставщикКодСтраныОтправки | Edm.String | true |
| АдресОтправки | Edm.String | true |
| СкладОтправкиИдентификатор | Edm.Int64 | true |
| СкладОтправитель_Key | Edm.Guid | true |
| ПоставщикАдвокат | Edm.Boolean | true |
| ПоставщикДоверитель | Edm.Boolean | true |
| ПоставщикЛизингодатель | Edm.Boolean | true |
| ПоставщикЛизингополучатель | Edm.Boolean | true |
| ПоставщикКомиссионер | Edm.Boolean | true |
| ПоставщикКомитент | Edm.Boolean | true |
| ПоставщикМедиатор | Edm.Boolean | true |
| ПоставщикНотариус | Edm.Boolean | true |
| ПоставщикРозничнаяРеализация | Edm.Boolean | true |
| ПоставщикРозничныйРеализатор | Edm.Boolean | true |
| ПоставщикУчастникСРП | Edm.Boolean | true |
| ПоставщикУчастникСовместнойДеятельности | Edm.Boolean | true |
| ПоставщикФармацевтическийПроизводитель | Edm.Boolean | true |
| ПоставщикФизическоеЛицо | Edm.Boolean | true |
| ПоставщикЧастныйСудебныйИсполнитель | Edm.Boolean | true |
| УдалитьПоставщикДополнительныеСведения | Edm.String | true |
| Получатель | Edm.String | true |
| ПолучательИдентификатор | Edm.String | true |
| ПолучательНерезидент | Edm.Boolean | true |
| ПолучательНаименование | Edm.String | true |
| ПолучательБИНСтруктурногоПодразделения | Edm.String | true |
| ПолучательБИНРеорганизованногоЛица | Edm.String | true |
| ПолучательКодСтраны | Edm.String | true |
| ПолучательКодСтраныДоставки | Edm.String | true |
| АдресДоставки | Edm.String | true |
| СкладДоставкиИдентификатор | Edm.Int64 | true |
| СкладПолучатель | Edm.String | true |
| ПолучательАдвокат | Edm.Boolean | true |
| ПолучательДоверитель | Edm.Boolean | true |
| УдалитьПолучательДополнительныеСведения | Edm.String | true |
| ПолучательКомиссионер | Edm.Boolean | true |
| ПолучательКомитент | Edm.Boolean | true |
| ПолучательЛизингодатель | Edm.Boolean | true |
| ПолучательЛизингополучатель | Edm.Boolean | true |
| ПолучательМедиатор | Edm.Boolean | true |
| ПолучательНотариус | Edm.Boolean | true |
| ПолучательРозничнаяРеализация | Edm.Boolean | true |
| ПолучательРозничныйРеализатор | Edm.Boolean | true |
| ПолучательУчастникСовместнойДеятельности | Edm.Boolean | true |
| ПолучательУчастникСРП | Edm.Boolean | true |
| ПолучательФармацевтическийПроизводитель | Edm.Boolean | true |
| ПолучательФизическоеЛицо | Edm.Boolean | true |
| ПолучательЧастныйСудебныйИсполнитель | Edm.Boolean | true |
| Грузоотправитель | Edm.String | true |
| ГрузоотправительИдентификатор | Edm.String | true |
| ГрузоотправительНаименование | Edm.String | true |
| ГрузоотправительНерезидент | Edm.Boolean | true |
| ГрузоотправительКодСтраныОтправки | Edm.String | true |
| ГрузоотправительДополнительныеСведения | Edm.String | true |
| Грузополучатель | Edm.String | true |
| ГрузополучательИдентификатор | Edm.String | true |
| ГрузополучательНаименование | Edm.String | true |
| ГрузополучательНерезидент | Edm.Boolean | true |
| ГрузополучательКодСтраныОтправки | Edm.String | true |
| ГрузополучательДополнительныеСведения | Edm.String | true |
| АвтомобильныйТранспорт | Edm.Boolean | true |
| АдресПолучателяПоЛицензии | Edm.String | true |
| АдресПоставщикаПоЛицензии | Edm.String | true |
| ВоздушныйТранспорт | Edm.Boolean | true |
| ГосНомерАТСФакт | Edm.String | true |
| ГосномерПрицепа | Edm.String | true |
| УдалитьДатаВвозаВывоза | Edm.DateTime | true |
| ДатаВремяПересеченияГосударственнойГраницы | Edm.DateTime | true |
| ДатаВыпискиНаБумажномНосителе | Edm.DateTime | true |
| ДатаДоверенностиОтпуск | Edm.DateTime | true |
| ДатаДоверенностиПриемка | Edm.DateTime | true |
| ДатаОтзыва | Edm.DateTime | true |
| ДатаПриема | Edm.DateTime | true |
| УдалитьДатаТТН | Edm.DateTime | true |
| ДоговорВРамкахУСДПолучательДата | Edm.DateTime | true |
| ДоговорВРамкахУСДПолучательНомер | Edm.String | true |
| ДоговорВРамкахУСДПоставщикДата | Edm.DateTime | true |
| ДоговорВРамкахУСДПоставщикНомер | Edm.String | true |
| ДоговорПоставки_Key | Edm.Guid | true |
| БезДоговора | Edm.Boolean | true |
| ДоговорПоставкиДата | Edm.DateTime | true |
| ДоговорПоставкиНомер | Edm.String | true |
| ДоговорПоставкиУсловияОплаты | Edm.String | true |
| ДоговорПоставкиУсловияПоставки | Edm.String | true |
| ДокументОснование | Edm.String | true |
| УдалитьЕстьТабачныеИзделияЦифроваяМаркировка | Edm.Boolean | true |
| ЖелезнодорожныйТранспорт | Edm.Boolean | true |
| ЗВСНомерРасходногоОрдераТребованиеЗаправки | Edm.String | true |
| ЗВСНомерРейса | Edm.String | true |
| ЗВСРегистрационныйНомерБорта | Edm.String | true |
| ЗВСТипВоздушногоСудна | Edm.String | true |
| Идентификатор | Edm.String | true |
| ИдентификаторТерриторииСЭЗ | Edm.Int64 | true |
| ИИНВодителя | Edm.String | true |
| ИИНВодителяФакт | Edm.String | true |
| КодОГДДоставкиG6 | Edm.String | true |
| КодОГДДоставкиG7 | Edm.String | true |
| КодОГДДоставкиG8 | Edm.String | true |
| КодОГДОтправкиG6 | Edm.String | true |
| КодОГДОтправкиG7 | Edm.String | true |
| КодОГДОтправкиG8 | Edm.String | true |
| КодОГДПолучателя | Edm.Int64 | true |
| КодОГДПоставщика | Edm.Int64 | true |
| КодОперацииG2 | Edm.Int16 | true |
| КодОперацииG4 | Edm.Int16 | true |
| КодОперацииG5 | Edm.Int16 | true |
| КодОперацииG6 | Edm.Int16 | true |
| КодОперацииG7 | Edm.Int16 | true |
| КодОперацииG8 | Edm.Int16 | true |
| Контрагент_Key | Edm.Guid | true |
| УдалитьМаркаАТС | Edm.String | true |
| МаркаАТСФакт | Edm.String | true |
| УдалитьМаркаПрицепа | Edm.String | true |
| МестоРеализацииНеРК | Edm.Boolean | true |
| МорскойТранспорт | Edm.Boolean | true |
| Мультимодальный | Edm.Boolean | true |
| НомерБорта | Edm.String | true |
| НомерВагона | Edm.String | true |
| НомерДоверенностиОтпуск | Edm.String | true |
| НомерДоверенностиПриемка | Edm.String | true |
| НомерЛицензииПолучателя | Edm.String | true |
| НомерЛицензииПоставщика | Edm.String | true |
| НомерОттискаПломбы | Edm.String | true |
| НомерСудна | Edm.String | true |
| НомерТС | Edm.String | true |
| УдалитьНомерТТН | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| ОтпускПроизвел | Edm.String | true |
| Перевозчик | Edm.String | true |
| ПеревозчикИдентификатор | Edm.String | true |
| ПеревозчикНаименование | Edm.String | true |
| ПеревозчикНерезидент | Edm.Boolean | true |
| ПриемПроизвел | Edm.String | true |
| Причина | Edm.String | true |
| ПричинаВыпискиНаБумажномНосителе | Edm.String | true |
| ПунктАвтомобильногоПропуска | Edm.String | true |
| УдалитьПунктВвозаВывоза | Edm.Int64 | true |
| Состояние | Edm.String | true |
| СПересечениемГраницы | Edm.Boolean | true |
| Статус | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| ТипПодписи | Edm.String | true |
| ТипПоставщикаG6 | Edm.String | true |
| ТипПоставщикаG7 | Edm.String | true |
| УдалитьТипСредстваИдентификации | Edm.String | true |
| Трубопровод | Edm.Boolean | true |
| ФИОВодителя | Edm.String | true |
| ФИОВодителяФакт | Edm.String | true |
| ФИОВыписывающегоСНТ | Edm.String | true |
| ФИОПодтвердившегоСНТ | Edm.String | true |
| ФИОСотрудникаОГД | Edm.String | true |
| ЭЦП | Edm.String | true |
| ЭЦПУполномоченногоПодписыватьСНТ | Edm.String | true |
| ЭЦПУполномоченногоПодтверждатьСНТ | Edm.String | true |
| ЭЦПЮрЛицаОтпуск | Edm.String | true |
| ЭЦПЮрЛицаПрием | Edm.String | true |
| Автор_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| ПредоставленВБумажномВиде | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| СтатусСопоставленияДляСНТ | Edm.String | true |
| ПрочийТранспорт | Edm.Boolean | true |
| ПолучательМалаяТорговаяТочка | Edm.Boolean | true |
| ПоставщикМалаяТорговаяТочка | Edm.Boolean | true |
| ПоставщикЗалогодержательХранитель | Edm.Boolean | true |
| ПолучательЗалогодержательХранитель | Edm.Boolean | true |
| УникальныйНомерВалютногоКонтроля | Edm.String | true |
| Товары | Document_СНТ_Товары_RowType | true |
| ТоварыВС | Document_СНТ_ТоварыВС_RowType | true |
| ЭтиловыйСпирт | Document_СНТ_ЭтиловыйСпирт_RowType | true |
| Виноматериал | Document_СНТ_Виноматериал_RowType | true |
| ПивоПивныеНапитки | Document_СНТ_ПивоПивныеНапитки_RowType | true |
| АлкогольнаяПродукцияКромеПива | Document_СНТ_АлкогольнаяПродукцияКромеПива_RowType | true |
| ДанныеПоНефтепродуктам | Document_СНТ_ДанныеПоНефтепродуктам_RowType | true |
| ДанныеПоБиотопливу | Document_СНТ_ДанныеПоБиотопливу_RowType | true |
| ТабачнаяПродукция | Document_СНТ_ТабачнаяПродукция_RowType | true |
| ДругиеТоварыЦифроваяМаркировка | Document_СНТ_ДругиеТоварыЦифроваяМаркировка_RowType | true |
| ТоварыЭкспортныйКонтроль | Document_СНТ_ТоварыЭкспортныйКонтроль_RowType | true |
| СведенияОГрузе | Document_СНТ_СведенияОГрузе_RowType | true |
| ПогрузочноРазгрузочныеОперации | Document_СНТ_ПогрузочноРазгрузочныеОперации_RowType | true |
| ПрочиеСведения | Document_СНТ_ПрочиеСведения_RowType | true |
| Таксировка | Document_СНТ_Таксировка_RowType | true |
| Ошибки | Document_СНТ_Ошибки_RowType | true |
| ДанныеОГрузе1_2 | Document_СНТ_ДанныеОГрузе1_2_RowType | true |
| Поставщик_Type | Edm.String | true |
| Получатель_Type | Edm.String | true |
| СкладПолучатель_Type | Edm.String | true |
| Грузоотправитель_Type | Edm.String | true |
| Грузополучатель_Type | Edm.String | true |
| ДокументОснование_Type | Edm.String | true |
| Перевозчик_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — Валюта
- [[Catalog_ВиртуальныеСклады]] — СкладОтправитель
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорПоставки
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеПолучатель
- [[Catalog_Пользователи]] — Автор
