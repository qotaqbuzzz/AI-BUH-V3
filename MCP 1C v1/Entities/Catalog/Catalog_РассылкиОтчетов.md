---
category: Catalog
properties: 53
relations: 4
---

# Catalog_РассылкиОтчетов

**Category:** Catalog  
**Properties:** 53  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Parent_Key | Edm.Guid | true |
| IsFolder | Edm.Boolean | true |
| DeletionMark | Edm.Boolean | true |
| FTPКаталог | Edm.String | true |
| FTPЛогин | Edm.String | true |
| FTPПассивноеСоединение | Edm.Boolean | true |
| FTPПорт | Edm.Int64 | true |
| FTPСервер | Edm.String | true |
| Автор_Key | Edm.Guid | true |
| АдресОтвета | Edm.String | true |
| Архивировать | Edm.Boolean | true |
| ВидПочтовогоАдресаПолучателей_Key | Edm.Guid | true |
| ВыполнятьПоРасписанию | Edm.Boolean | true |
| ИмяАрхива | Edm.String | true |
| ИспользоватьFTPРесурс | Edm.Boolean | true |
| ИспользоватьПапку | Edm.Boolean | true |
| ИспользоватьСетевойКаталог | Edm.Boolean | true |
| ИспользоватьЭлектроннуюПочту | Edm.Boolean | true |
| КартинкиПисьмаВФорматеHTML_Base64Data | Edm.Binary | true |
| Личная | Edm.Boolean | true |
| Папка_Key | Edm.Guid | true |
| ПериодичностьРасписания | Edm.String | true |
| Персонализирована | Edm.Boolean | true |
| ПисьмоВФорматеHTML | Edm.Boolean | true |
| Подготовлена | Edm.Boolean | true |
| РегламентноеЗадание | Edm.Guid | true |
| СетевойКаталогLinux | Edm.String | true |
| СетевойКаталогWindows | Edm.String | true |
| СкрытыеКопии | Edm.Boolean | true |
| ТекстПисьма | Edm.String | true |
| ТекстПисьмаВФорматеHTML | Edm.String | true |
| ТемаПисьма | Edm.String | true |
| ТипПолучателейРассылки | Edm.String | true |
| ТолькоУведомить | Edm.Boolean | true |
| ТранслитерироватьИменаФайлов | Edm.Boolean | true |
| УчетнаяЗапись_Key | Edm.Guid | true |
| СозданаИзФормыОтчета | Edm.Boolean | true |
| УдалитьВключатьДатуВИмяФайла | Edm.Boolean | true |
| ВажностьПисьма | Edm.String | true |
| ВставлятьОтчетыВТекстПисьма | Edm.Boolean | true |
| ПрикреплятьОтчетыВоВложения | Edm.Boolean | true |
| УстановитьПаролиЗашифровать | Edm.Boolean | true |
| Отчеты | Catalog_РассылкиОтчетов_Отчеты_RowType | true |
| ФорматыОтчетов | Catalog_РассылкиОтчетов_ФорматыОтчетов_RowType | true |
| Получатели | Catalog_РассылкиОтчетов_Получатели_RowType | true |
| КартинкиПисьмаВФорматеHTML_Type | Edm.String | true |
| ТипПолучателейРассылки_Type | Edm.String | true |
| КартинкиПисьмаВФорматеHTML | Edm.Stream | true |

## Related Entities

- [[Catalog_ВидыКонтактнойИнформации]] — ВидПочтовогоАдресаПолучателей
- [[Catalog_ПапкиФайлов]] — Папка
- [[Catalog_Пользователи]] — Автор
- [[Catalog_УчетныеЗаписиЭлектроннойПочты]] — УчетнаяЗапись
