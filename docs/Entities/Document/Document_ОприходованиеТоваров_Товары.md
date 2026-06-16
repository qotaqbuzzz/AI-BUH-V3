---
category: Document
properties: 26
relations: 8
---

# Document_ОприходованиеТоваров_Товары

**Category:** Document  
**Properties:** 26  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| КорСчетОприходованияБУ_Key | Edm.Guid | true |
| КорСубконтоОприходованияБУ1 | Edm.String | true |
| КорСубконтоОприходованияБУ2 | Edm.String | true |
| КорСубконтоОприходованияБУ3 | Edm.String | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| КорСчетОприходованияНУ_Key | Edm.Guid | true |
| КорСубконтоОприходованияНУ1 | Edm.String | true |
| КорСубконтоОприходованияНУ2 | Edm.String | true |
| КорСубконтоОприходованияНУ3 | Edm.String | true |
| НомерГТД_Key | Edm.Guid | true |
| ДоговорЗакупа_Key | Edm.Guid | true |
| КорСубконтоОприходованияБУ1_Type | Edm.String | true |
| КорСубконтоОприходованияБУ2_Type | Edm.String | true |
| КорСубконтоОприходованияБУ3_Type | Edm.String | true |
| КорСубконтоОприходованияНУ1_Type | Edm.String | true |
| КорСубконтоОприходованияНУ2_Type | Edm.String | true |
| КорСубконтоОприходованияНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[ChartOfAccounts_Налоговый]] — КорСчетОприходованияНУ
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — КорСчетОприходованияБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
