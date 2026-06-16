---
category: Document
properties: 11
relations: 1
---

# Document_РасчетПениОПВиСО_ИсчислениеПени

**Category:** Document  
**Properties:** 11  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо | Edm.String | true |
| МесяцНалоговогоПериода | Edm.DateTime | true |
| Сумма | Edm.Double | true |
| ДатаНачала | Edm.DateTime | true |
| ДатаОкончания | Edm.DateTime | true |
| СтруктурнаяЕдиница | Edm.String | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| ФизЛицо_Type | Edm.String | true |
| СтруктурнаяЕдиница_Type | Edm.String | true |

## Related Entities

- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
