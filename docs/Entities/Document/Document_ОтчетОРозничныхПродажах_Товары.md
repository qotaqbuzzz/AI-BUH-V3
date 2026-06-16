---
category: Document
properties: 52
relations: 16
---

# Document_ОтчетОРозничныхПродажах_Товары

**Category:** Document  
**Properties:** 52  
**Relations:** 16

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| АкцизВидОперацииРеализации_Key | Edm.Guid | true |
| ДокументОприходования | Edm.String | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| КлючСвязи | Edm.Int64 | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| Номенклатура_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |
| Себестоимость | Edm.Double | true |
| СтавкаАкциза_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СтранаПроисхождения_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СубконтоДоходовНУ1 | Edm.String | true |
| СубконтоДоходовНУ2 | Edm.String | true |
| СубконтоДоходовНУ3 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ1 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ2 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ3 | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ1 | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ2 | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ3 | Edm.String | true |
| Сумма | Edm.Double | true |
| СуммаАкциза | Edm.Double | true |
| СуммаНДС | Edm.Double | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СчетДоходовНУ_Key | Edm.Guid | true |
| СчетСписанияСебестоимостиБУ_Key | Edm.Guid | true |
| СчетСписанияСебестоимостиНУ_Key | Edm.Guid | true |
| СчетУчетаАкцизаПоРеализации_Key | Edm.Guid | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| ДокументОприходования_Type | Edm.String | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |
| СубконтоДоходовНУ1_Type | Edm.String | true |
| СубконтоДоходовНУ2_Type | Edm.String | true |
| СубконтоДоходовНУ3_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ1_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ2_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ3_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ1_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ2_Type | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыОперацийОблагаемыхАкцизом]] — АкцизВидОперацииРеализации
- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_КлассификаторСтранМира]] — СтранаПроисхождения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
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
