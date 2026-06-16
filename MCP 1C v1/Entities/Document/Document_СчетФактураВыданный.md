---
category: Document
properties: 71
relations: 16
---

# Document_СчетФактураВыданный

**Category:** Document  
**Properties:** 71  
**Relations:** 16

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| ВалютаДокумента_Key | Edm.Guid | true |
| Грузоотправитель | Edm.String | true |
| Грузополучатель_Key | Edm.Guid | true |
| УдалитьДоверенность | Edm.String | true |
| ДоверенностьЛицо | Edm.String | true |
| ДоговорКонтрагента_Key | Edm.Guid | true |
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Контрагент_Key | Edm.Guid | true |
| КратностьВзаиморасчетов | Edm.Int64 | true |
| КурсВзаиморасчетов | Edm.Double | true |
| Организация_Key | Edm.Guid | true |
| ОсновнойСчетФактура_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПодтвержденДокументамиОтгрузки | Edm.Boolean | true |
| ПунктНазначения | Edm.String | true |
| СпособОтправления | Edm.String | true |
| СуммаВключаетАкциз | Edm.Boolean | true |
| СуммаВключаетНДС | Edm.Boolean | true |
| СуммаДокумента | Edm.Double | true |
| СчетКонтрагента_Key | Edm.Guid | true |
| СчетОрганизации_Key | Edm.Guid | true |
| ТипЦен_Key | Edm.Guid | true |
| УсловияОплаты | Edm.String | true |
| УчитыватьАкциз | Edm.Boolean | true |
| УчитыватьНДС | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| Поставщик_Key | Edm.Guid | true |
| Покупатель_Key | Edm.Guid | true |
| СтранаНазначения_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| ВидСчетаФактуры | Edm.String | true |
| СпособВыставления | Edm.String | true |
| ДатаСовершенияОборотаПоРеализации | Edm.DateTime | true |
| ГосучреждениеКодТоваров | Edm.String | true |
| ГосучреждениеНазначениеПлатежа | Edm.String | true |
| УдалитьДополнительная | Edm.Boolean | true |
| ДоверенностьВыдана | Edm.String | true |
| ДоверенностьДата | Edm.DateTime | true |
| ДоверенностьНомер | Edm.String | true |
| КАС_НомерГТД | Edm.String | true |
| КАС_УНК | Edm.String | true |
| КАС_ДатаПересеченияГраницы | Edm.String | true |
| АдресДоставки | Edm.String | true |
| УсловияПоставки | Edm.String | true |
| СпособОтправленияПоКлассификатору | Edm.String | true |
| ДатаОборотаВТабличнойЧасти | Edm.Boolean | true |
| КАС_ТТН | Edm.String | true |
| КАС_ФИОБрокера | Edm.String | true |
| КАС_КонтактБрокера | Edm.String | true |
| КАС_КонтрагентБрокер_Key | Edm.Guid | true |
| КАС_ОтветственныйСотрудник_Key | Edm.Guid | true |
| КАС_ПодтверждениеАстана1 | Edm.Boolean | true |
| НДСЗаНерезидента | Edm.Boolean | true |
| Товары | Document_СчетФактураВыданный_Товары_RowType | true |
| Услуги | Document_СчетФактураВыданный_Услуги_RowType | true |
| ОС | Document_СчетФактураВыданный_ОС_RowType | true |
| НМА | Document_СчетФактураВыданный_НМА_RowType | true |
| ДокументыОснования | Document_СчетФактураВыданный_ДокументыОснования_RowType | true |
| УчастникиСовместнойДеятельности | Document_СчетФактураВыданный_УчастникиСовместнойДеятельности_RowType | true |
| НомераГТД | Document_СчетФактураВыданный_НомераГТД_RowType | true |
| ДатыПересеченияГраницы | Document_СчетФактураВыданный_ДатыПересеченияГраницы_RowType | true |
| Грузоотправитель_Type | Edm.String | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_БанковскиеСчета]] — СчетКонтрагента
- [[Catalog_БанковскиеСчета]] — СчетОрганизации
- [[Catalog_Валюты]] — ВалютаДокумента
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорКонтрагента
- [[Catalog_КлассификаторСтранМира]] — СтранаНазначения
- [[Catalog_Контрагенты]] — Грузополучатель
- [[Catalog_Контрагенты]] — КАС_КонтрагентБрокер
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Контрагенты]] — Покупатель
- [[Catalog_Организации]] — Организация
- [[Catalog_Организации]] — Поставщик
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СотрудникиОрганизаций]] — КАС_ОтветственныйСотрудник
- [[Catalog_ТипыЦенНоменклатуры]] — ТипЦен
