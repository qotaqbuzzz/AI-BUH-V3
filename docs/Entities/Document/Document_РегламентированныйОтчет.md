---
category: Document
properties: 33
relations: 5
---

# Document_РегламентированныйОтчет

**Category:** Document  
**Properties:** 33  
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
| Автор_Key | Edm.Guid | true |
| ВидОтчетности | Edm.String | true |
| ВыбраннаяФорма | Edm.String | true |
| ДанныеОтчета_Base64Data | Edm.Binary | true |
| ДатаНачала | Edm.DateTime | true |
| ДатаОкончания | Edm.DateTime | true |
| ДатаПодписи | Edm.DateTime | true |
| ЕдиницаИзмерения | Edm.String | true |
| ИсточникОтчета | Edm.String | true |
| Комментарий | Edm.String | true |
| НаименованиеОтчета | Edm.String | true |
| НалоговыйКомитет_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Периодичность | Edm.String | true |
| ТочностьЕдиницыИзмерения | Edm.Int16 | true |
| ДокументОтраженияВУчете_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ПредставлениеПериода | Edm.String | true |
| ИдентификаторПользователяОтчетность1С | Edm.String | true |
| ИдентификаторФормыВСистемеПриемаОтчетность1С | Edm.Int64 | true |
| ИдентификаторФормыОтчетность1С | Edm.String | true |
| СтатусПриемаОтчетность1С | Edm.String | true |
| СтатусРазноскиОтчетность1С | Edm.String | true |
| НомерУведомленияОтчетность1С | Edm.String | true |
| ДатаУведомленияОтчетность1С | Edm.String | true |
| ДанныеОтчета_Type | Edm.String | true |
| ДанныеОтчета | Edm.Stream | true |

## Related Entities

- [[Catalog_Контрагенты]] — НалоговыйКомитет
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Document_ОтражениеНалоговойОтчетностиВРеглУчете]] — ДокументОтраженияВУчете
