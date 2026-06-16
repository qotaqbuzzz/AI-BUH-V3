---
category: Document
properties: 45
relations: 12
---

# Document_АктОбОказанииПроизводственныхУслуг_Услуги

**Category:** Document  
**Properties:** 45  
**Relations:** 12

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Номенклатура_Key | Edm.Guid | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Цена | Edm.Double | true |
| Количество | Edm.Double | true |
| Коэффициент | Edm.Double | true |
| УДАЛИТЬНоменклатурнаяГруппа_Key | Edm.Guid | true |
| ПлановаяСтоимость | Edm.Double | true |
| Спецификация_Key | Edm.Guid | true |
| СтавкаНДС_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СуммаНДС | Edm.Double | true |
| СуммаПлановая | Edm.Double | true |
| УДАЛИТЬСчетЗатрат_Key | Edm.Guid | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| СчетСписанияСебестоимостиБУ_Key | Edm.Guid | true |
| СубконтоСписанияСебестоимостиБУ1 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ2 | Edm.String | true |
| СубконтоСписанияСебестоимостиБУ3 | Edm.String | true |
| СчетДоходовНУ_Key | Edm.Guid | true |
| СубконтоДоходовНУ1 | Edm.String | true |
| СубконтоДоходовНУ2 | Edm.String | true |
| СубконтоДоходовНУ3 | Edm.String | true |
| СчетСписанияСебестоимостиНУ_Key | Edm.Guid | true |
| СубконтоСписанияСебестоимостиНУ1 | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ2 | Edm.String | true |
| СубконтоСписанияСебестоимостиНУ3 | Edm.String | true |
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

- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НоменклатурныеГруппы]] — УДАЛИТЬНоменклатурнаяГруппа
- [[Catalog_СпецификацииНоменклатуры]] — Спецификация
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетДоходовНУ
- [[ChartOfAccounts_Налоговый]] — СчетСписанияСебестоимостиНУ
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетСписанияСебестоимостиБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
- [[ChartOfAccounts_Типовой]] — УДАЛИТЬСчетЗатрат
