---
category: Document
properties: 16
relations: 8
---

# Document_ВозвратТоваровПоставщику_Товары

**Category:** Document  
**Properties:** 16  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Коэффициент | Edm.Double | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СчетУчетаНДС_Key | Edm.Guid | true |
| НДСВидОборота | Edm.String | true |
| НДСВидПоступления_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_ВидыПоступления]] — НДСВидПоступления
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДС
