---
category: Document
properties: 14
relations: 8
---

# Document_ОтчетПроизводстваЗаСмену_Продукция

**Category:** Document  
**Properties:** 14  
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
| НоменклатурнаяГруппа_Key | Edm.Guid | true |
| СчетБУ_Key | Edm.Guid | true |
| СчетЗатрат_Key | Edm.Guid | true |
| ПлановаяСтоимость | Edm.Double | true |
| СуммаПлановая | Edm.Double | true |
| Спецификация_Key | Edm.Guid | true |
| СчетНУ_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НоменклатурныеГруппы]] — НоменклатурнаяГруппа
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_СпецификацииНоменклатуры]] — Спецификация
- [[ChartOfAccounts_Налоговый]] — СчетНУ
- [[ChartOfAccounts_Типовой]] — СчетБУ
- [[ChartOfAccounts_Типовой]] — СчетЗатрат
