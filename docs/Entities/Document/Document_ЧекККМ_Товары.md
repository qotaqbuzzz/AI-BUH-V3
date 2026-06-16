---
category: Document
properties: 29
relations: 8
---

# Document_ЧекККМ_Товары

**Category:** Document  
**Properties:** 29  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ1 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ2 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ3 | Edm.String | true |
| Сумма | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СчетСписанияСебестоимостиБУ_Key | Edm.Guid | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| Штрихкод | Edm.String | true |
| КодМаркировки | Edm.String | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ1_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ2_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетСписанияСебестоимостиБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
