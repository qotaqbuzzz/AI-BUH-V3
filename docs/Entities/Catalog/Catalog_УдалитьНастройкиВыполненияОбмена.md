---
category: Catalog
properties: 23
relations: 1
---

# Catalog_УдалитьНастройкиВыполненияОбмена

**Category:** Catalog  
**Properties:** 23  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| ВыполнятьДействияПодПолнымиПравами | Edm.Boolean | true |
| ИспользоватьРегламентныеЗадания | Edm.Boolean | true |
| РегламентноеЗадание | Edm.String | true |
| ДинамическиИзменятьИнтервалМеждуОбменами | Edm.Boolean | true |
| Ответственный_Key | Edm.Guid | true |
| КаждыйЗапускПрограммы | Edm.Boolean | true |
| КаждоеЗавершениеРаботыСПрограммой | Edm.Boolean | true |
| КаталогПроверкиДоступности | Edm.String | true |
| ВыполнятьОбменПриПоявленииФайла | Edm.String | true |
| КоличествоЭлементовВТранзакцииНаВыгрузкуДанных | Edm.Int64 | true |
| КоличествоЭлементовВТранзакцииНаЗагрузкуДанных | Edm.Int64 | true |
| УчетнаяЗаписьОтправкиСообщенияОбОшибке | Edm.String | true |
| АдресДляОтправкиСообщенийОбОшибке | Edm.String | true |
| Комментарий | Edm.String | true |
| НастройкиОбмена | Catalog_УдалитьНастройкиВыполненияОбмена_НастройкиОбмена_RowType | true |
| СообщенияНеЯвляющиесяОшибками | Catalog_УдалитьНастройкиВыполненияОбмена_СообщенияНеЯвляющиесяОшибками_RowType | true |

## Related Entities

- [[Catalog_Пользователи]] — Ответственный
