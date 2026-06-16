---
category: Document
properties: 21
relations: 4
---

# Document_ОтчетПроизводстваЗаСмену_Услуги

**Category:** Document  
**Properties:** 21  
**Relations:** 4

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| СчетЗатрат_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| ПлановаяСтоимость | Edm.Double | true |
| СуммаПлановая | Edm.Double | true |
| СчетБУ_Key | Edm.Guid | true |
| СубконтоБУ1 | Edm.String | true |
| СубконтоБУ2 | Edm.String | true |
| СубконтоБУ3 | Edm.String | true |
| СчетНУ_Key | Edm.Guid | true |
| СубконтоНУ1 | Edm.String | true |
| СубконтоНУ2 | Edm.String | true |
| СубконтоНУ3 | Edm.String | true |
| СубконтоБУ1_Type | Edm.String | true |
| СубконтоБУ2_Type | Edm.String | true |
| СубконтоБУ3_Type | Edm.String | true |
| СубконтоНУ1_Type | Edm.String | true |
| СубконтоНУ2_Type | Edm.String | true |
| СубконтоНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_Номенклатура]] — Номенклатура
- [[ChartOfAccounts_Налоговый]] — СчетНУ
- [[ChartOfAccounts_Типовой]] — СчетБУ
- [[ChartOfAccounts_Типовой]] — СчетЗатрат
