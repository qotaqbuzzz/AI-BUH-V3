---
category: Document
properties: 12
relations: 7
---

# Document_СписаниеОС_Товары

**Category:** Document  
**Properties:** 12  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| Склад_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_Склады]] — Склад
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
