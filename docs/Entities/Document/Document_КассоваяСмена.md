---
category: Document
properties: 26
relations: 2
---

# Document_КассоваяСмена

**Category:** Document  
**Properties:** 26  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| ДатаПервогоНепереданногоФД | Edm.DateTime | true |
| ДатаСменыККТ | Edm.DateTime | true |
| КассаККМ | Edm.String | true |
| КоличествоНепереданныхФД | Edm.Int64 | true |
| КоличествоФД | Edm.Int64 | true |
| КоличествоЧеков | Edm.Int64 | true |
| Комментарий | Edm.String | true |
| НачалоКассовойСмены | Edm.DateTime | true |
| НеобходимаСтрочнаяЗаменаФН | Edm.Boolean | true |
| НомерСменыККТ | Edm.Int64 | true |
| ОкончаниеКассовойСмены | Edm.DateTime | true |
| Организация_Key | Edm.Guid | true |
| ПамятьФНПереполнена | Edm.Boolean | true |
| ПревышеноВремяОжиданияОтветаОФД | Edm.Boolean | true |
| РесурсФНИсчерпан | Edm.Boolean | true |
| Статус | Edm.String | true |
| ФДОЗакрытииСмены_Base64Data | Edm.Binary | true |
| ФискальноеУстройство_Key | Edm.Guid | true |
| ФДОЗакрытииСмены_Type | Edm.String | true |
| ФДОЗакрытииСмены | Edm.Stream | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_ПодключаемоеОборудование]] — ФискальноеУстройство
