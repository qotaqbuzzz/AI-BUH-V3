---
category: Document
properties: 9
relations: 1
---

# Document_УдержаниеИПНиОПВНУ_УдержанныйОПВ

**Category:** Document  
**Properties:** 9  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо | Edm.String | true |
| Взнос | Edm.Double | true |
| МесяцНалоговогоПериода | Edm.DateTime | true |
| СтруктурнаяЕдиница | Edm.String | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| ФизЛицо_Type | Edm.String | true |
| СтруктурнаяЕдиница_Type | Edm.String | true |

## Related Entities

- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
