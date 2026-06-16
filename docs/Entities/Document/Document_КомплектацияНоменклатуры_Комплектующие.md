---
category: Document
properties: 12
relations: 6
---

# Document_КомплектацияНоменклатуры_Комплектующие

**Category:** Document  
**Properties:** 12  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ДоляСтоимости | Edm.Int64 | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |
| КлючСвязи | Edm.Int64 | true |
| ДоговорЗакупа_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
