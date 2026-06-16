---
category: Document
properties: 10
relations: 1
---

# Document_РасчетНалоговПриПоступленииАктивовУслуг_ИсчисленныйИПН

**Category:** Document  
**Properties:** 10  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ФизЛицо_Key | Edm.Guid | true |
| Налог | Edm.Double | true |
| ПримененныйВычет | Edm.Double | true |
| ПримененнаяЛьгота | Edm.Double | true |
| РазрешенныйВычет | Edm.Double | true |
| МесяцНалоговогоПериода | Edm.DateTime | true |
| ОблагаемаяБаза | Edm.Double | true |
| НалогСПревышения | Edm.Double | true |

## Related Entities

- [[Catalog_Контрагенты]] — ФизЛицо
