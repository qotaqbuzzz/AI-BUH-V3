---
category: Document
properties: 11
relations: 3
---

# Document_ИнвентаризацияТоваровНаСкладе_Товары

**Category:** Document  
**Properties:** 11  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| КоличествоУчет | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СуммаУчет | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| Цена | Edm.Double | true |

## Related Entities

- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
