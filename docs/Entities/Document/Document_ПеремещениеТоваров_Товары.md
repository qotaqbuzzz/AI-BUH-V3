---
category: Document
properties: 12
relations: 7
---

# Document_ПеремещениеТоваров_Товары

**Category:** Document  
**Properties:** 12  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Коэффициент | Edm.Double | true |
| Количество | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| НовыйСчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| НовыйСчетУчетаНУ_Key | Edm.Guid | true |
| КлючСвязи | Edm.Int64 | true |
| ДоговорЗакупа_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[ChartOfAccounts_Налоговый]] — НовыйСчетУчетаНУ
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — НовыйСчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
