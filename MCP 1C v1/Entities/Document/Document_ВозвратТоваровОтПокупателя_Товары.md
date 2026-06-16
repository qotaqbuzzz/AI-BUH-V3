---
category: Document
properties: 49
relations: 15
---

# Document_ВозвратТоваровОтПокупателя_Товары

**Category:** Document  
**Properties:** 49  
**Relations:** 15

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Коэффициент | Edm.Double | true |
| Себестоимость | Edm.Double | true |
| Цена | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| СчетСписанияСебестоимостиБУ_Key | Edm.Guid | true |
| СубконтоСписанияСебестоимостиБУ1 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ2 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ3 | Edm.String | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| СчетДоходовНУ_Key | Edm.Guid | true |
| СубконтоДоходовНУ1 | Edm.String | true |
| СубконтоДоходовНУ2 | Edm.String | true |
| СубконтоДоходовНУ3 | Edm.String | true |
| СчетСписанияСебестоимостиНУ_Key | Edm.Guid | true |
| СубконтоСписанияСебестоимостиНУ1 | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ2 | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ3 | Edm.String | true |
| СтавкаАкциза_Key | Edm.Guid | true |
| СчетУчетаАкцизаПоРеализации_Key | Edm.Guid | true |
| СуммаАкциза | Edm.Double | true |
| АкцизВидОперацииРеализации_Key | Edm.Guid | true |
| КлючСвязи | Edm.Int64 | true |
| ДоговорЗакупа_Key | Edm.Guid | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ1_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ2_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ3_Type | Edm.String | true |
| СубконтоДоходовНУ1_Type | Edm.String | true |
| СубконтоДоходовНУ2_Type | Edm.String | true |
| СубконтоДоходовНУ3_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ1_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ2_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыОперацийОблагаемыхАкцизом]] — АкцизВидОперацииРеализации
- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_СтавкиАкциза]] — СтавкаАкциза
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетДоходовНУ
- [[ChartOfAccounts_Налоговый]] — СчетСписанияСебестоимостиНУ
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетСписанияСебестоимостиБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаАкцизаПоРеализации
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
