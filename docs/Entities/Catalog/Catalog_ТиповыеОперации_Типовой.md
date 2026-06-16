---
category: Catalog
properties: 27
relations: 4
---

# Catalog_ТиповыеОперации_Типовой

**Category:** Catalog  
**Properties:** 27  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетДт_Key | Edm.Guid | true |
| СубконтоДт1 | Edm.String | true |
| СубконтоДт2 | Edm.String | true |
| СубконтоДт3 | Edm.String | true |
| КоличествоДт | Edm.Double | true |
| ВалютаДт_Key | Edm.Guid | true |
| ВалютнаяСуммаДт | Edm.Double | true |
| СчетКт_Key | Edm.Guid | true |
| СубконтоКт1 | Edm.String | true |
| СубконтоКт2 | Edm.String | true |
| СубконтоКт3 | Edm.String | true |
| КоличествоКт | Edm.Double | true |
| ВалютаКт_Key | Edm.Guid | true |
| ВалютнаяСуммаКт | Edm.Double | true |
| Сумма | Edm.Double | true |
| Содержание | Edm.String | true |
| НомерЖурнала | Edm.String | true |
| Формулы | Edm.String | true |
| Условие | Edm.String | true |
| СубконтоДт1_Type | Edm.String | true |
| СубконтоДт2_Type | Edm.String | true |
| СубконтоДт3_Type | Edm.String | true |
| СубконтоКт1_Type | Edm.String | true |
| СубконтоКт2_Type | Edm.String | true |
| СубконтоКт3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Валюты]] — ВалютаДт
- [[Catalog_Валюты]] — ВалютаКт
- [[ChartOfAccounts_Типовой]] — СчетДт
- [[ChartOfAccounts_Типовой]] — СчетКт
