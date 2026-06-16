---
category: Document
properties: 29
relations: 10
---

# Document_СписаниеТоваров_Товары

**Category:** Document  
**Properties:** 29  
**Relations:** 10

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СубконтоЗатратБУ1 | Edm.String | true |
| СубконтоЗатратБУ2 | Edm.String | true |
| СубконтоЗатратБУ3 | Edm.String | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| СубконтоЗатратНУ1 | Edm.String | true |
| СубконтоЗатратНУ2 | Edm.String | true |
| СубконтоЗатратНУ3 | Edm.String | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| КлючСвязи | Edm.Int64 | true |
| ДоговорЗакупа_Key | Edm.Guid | true |
| ПричинаСписания | Edm.String | true |
| СубконтоЗатратБУ1_Type | Edm.String | true |
| СубконтоЗатратБУ2_Type | Edm.String | true |
| СубконтоЗатратБУ3_Type | Edm.String | true |
| СубконтоЗатратНУ1_Type | Edm.String | true |
| СубконтоЗатратНУ2_Type | Edm.String | true |
| СубконтоЗатратНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
