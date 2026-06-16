---
category: Document
properties: 15
relations: 6
---

# Document_РегистрацияПрочихОперацийПоРеализованнымТоварамВЦеляхНДС_Товары

**Category:** Document  
**Properties:** 15  
**Relations:** 6

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
| ОборотПоРеализации | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| Цена | Edm.Double | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| ГТД_Key | Edm.Guid | true |
| КлючСвязи | Edm.Int64 | true |

## Related Entities

- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — ГТД
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
