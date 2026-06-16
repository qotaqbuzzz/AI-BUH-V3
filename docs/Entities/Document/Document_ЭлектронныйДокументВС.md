---
category: Document
properties: 55
relations: 7
---

# Document_ЭлектронныйДокументВС

**Category:** Document  
**Properties:** 55  
**Relations:** 7

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
| ПолучательАдрес | Edm.String | true |
| ПолучательНаименование | Edm.String | true |
| ПолучательИдентификатор | Edm.String | true |
| СкладПолучатель_Key | Edm.Guid | true |
| СкладПолучательИдентификатор | Edm.Int64 | true |
| СкладПолучательНаименование | Edm.String | true |
| ОтправительАдрес | Edm.String | true |
| ОтправительНаименование | Edm.String | true |
| ОтправительИдентификатор | Edm.String | true |
| СкладОтправитель_Key | Edm.Guid | true |
| СкладОтправительИдентификатор | Edm.Int64 | true |
| СкладОтправительНаименование | Edm.String | true |
| ДатаИсходногоДокумента | Edm.DateTime | true |
| Комментарий | Edm.String | true |
| РегистрационныйНомер | Edm.String | true |
| ТипФормы | Edm.String | true |
| ПричинаСписания | Edm.String | true |
| ВерсияУТТН | Edm.Int16 | true |
| Идентификатор | Edm.String | true |
| Статус | Edm.String | true |
| ТипПодписи | Edm.String | true |
| ОбщаяСуммаТоваров | Edm.Double | true |
| ВидДетализации | Edm.String | true |
| ОбщаяСуммаИсходныхТоваров | Edm.Double | true |
| ЭЦП | Edm.String | true |
| Причина | Edm.String | true |
| ДокументОснование | Edm.String | true |
| КорректировкаИП | Edm.Boolean | true |
| КорректируемыйДокументЭДВС_Key | Edm.Guid | true |
| ПрефиксВидаДокумента | Edm.String | true |
| НомерУчетногоДокумента | Edm.String | true |
| НомерПакета | Edm.String | true |
| ОрганизацияПолучатель_Key | Edm.Guid | true |
| Состояние | Edm.String | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| НомерДоговораСРППолучатель | Edm.String | true |
| ДатаДоговораСРППолучатель | Edm.String | true |
| НомерДоговораСРПОтправитель | Edm.String | true |
| ДатаДоговораСРПОтправитель | Edm.String | true |
| Автор_Key | Edm.Guid | true |
| ВидКорректировкиДанных | Edm.String | true |
| Товары | Document_ЭлектронныйДокументВС_Товары_RowType | true |
| ТоварыВС | Document_ЭлектронныйДокументВС_ТоварыВС_RowType | true |
| ИсходныеТовары | Document_ЭлектронныйДокументВС_ИсходныеТовары_RowType | true |
| ИсходныеТоварыВС | Document_ЭлектронныйДокументВС_ИсходныеТоварыВС_RowType | true |
| Ошибки | Document_ЭлектронныйДокументВС_Ошибки_RowType | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВиртуальныеСклады]] — СкладОтправитель
- [[Catalog_ВиртуальныеСклады]] — СкладПолучатель
- [[Catalog_Организации]] — Организация
- [[Catalog_Организации]] — ОрганизацияПолучатель
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеПолучатель
- [[Catalog_Пользователи]] — Автор
