---
category: Document
properties: 29
relations: 7
---

# Document_ОтражениеНалоговойОтчетностиВРеглУчете_ОтражениеВУчете

**Category:** Document  
**Properties:** 29  
**Relations:** 7

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Период | Edm.DateTime | true |
| ВидНалога_Key | Edm.Guid | true |
| КодБК | Edm.String | true |
| СчетЗатратБУ_Key | Edm.Guid | true |
| СубконтоЗатратБУ1 | Edm.String | true |
| СубконтоЗатратБУ2 | Edm.String | true |
| СубконтоЗатратБУ3 | Edm.String | true |
| СчетНалогаБУ_Key | Edm.Guid | true |
| ВидПлатежаВБюджет | Edm.String | true |
| СчетЗатратНУ_Key | Edm.Guid | true |
| СубконтоЗатратНУ1 | Edm.String | true |
| СубконтоЗатратНУ2 | Edm.String | true |
| СубконтоЗатратНУ3 | Edm.String | true |
| СчетНалогаНУ_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| Содержание | Edm.String | true |
| СтруктурнаяЕдиница | Edm.String | true |
| НалоговыйКомитет_Key | Edm.Guid | true |
| ФизЛицо_Key | Edm.Guid | true |
| СуммаДохода | Edm.Double | true |
| СубконтоЗатратБУ1_Type | Edm.String | true |
| СубконтоЗатратБУ2_Type | Edm.String | true |
| СубконтоЗатратБУ3_Type | Edm.String | true |
| СубконтоЗатратНУ1_Type | Edm.String | true |
| СубконтоЗатратНУ2_Type | Edm.String | true |
| СубконтоЗатратНУ3_Type | Edm.String | true |
| СтруктурнаяЕдиница_Type | Edm.String | true |

## Related Entities

- [[Catalog_Контрагенты]] — НалоговыйКомитет
- [[Catalog_НалогиСборыОтчисления]] — ВидНалога
- [[Catalog_ФизическиеЛица]] — ФизЛицо
- [[ChartOfAccounts_Налоговый]] — СчетЗатратНУ
- [[ChartOfAccounts_Налоговый]] — СчетНалогаНУ
- [[ChartOfAccounts_Типовой]] — СчетЗатратБУ
- [[ChartOfAccounts_Типовой]] — СчетНалогаБУ
