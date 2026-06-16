---
category: Document
properties: 39
relations: 8
---

# Document_ПередачаОС_ОС

**Category:** Document  
**Properties:** 39  
**Relations:** 8

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| СтоимостьБУ | Edm.Double | true |
| АмортизацияБУ | Edm.Double | true |
| АмортизацияЗаМесяцБУ | Edm.Double | true |
| Сумма | Edm.Double | true |
| СтавкаНДС_Key | Edm.Guid | true |
| СуммаНДС | Edm.Double | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СчетРасходовБУ_Key | Edm.Guid | true |
| СубконтоРасходовБУ1 | Edm.String | true |
| СубконтоРасходовБУ2 | Edm.String | true |
| СубконтоРасходовБУ3 | Edm.String | true |
| СчетУчетаНДСПоРеализации_Key | Edm.Guid | true |
| СчетДоходовНУ_Key | Edm.Guid | true |
| СубконтоДоходовНУ1 | Edm.String | true |
| СубконтоДоходовНУ2 | Edm.String | true |
| СубконтоДоходовНУ3 | Edm.String | true |
| СчетРасходовНУ_Key | Edm.Guid | true |
| СубконтоРасходовНУ1 | Edm.String | true |
| СубконтоРасходовНУ2 | Edm.String | true |
| СубконтоРасходовНУ3 | Edm.String | true |
| НДСВидОперацииРеализации_Key | Edm.Guid | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |
| СубконтоРасходовБУ1_Type | Edm.String | true |
| СубконтоРасходовБУ2_Type | Edm.String | true |
| СубконтоРасходовБУ3_Type | Edm.String | true |
| СубконтоДоходовНУ1_Type | Edm.String | true |
| СубконтоДоходовНУ2_Type | Edm.String | true |
| СубконтоДоходовНУ3_Type | Edm.String | true |
| СубконтоРасходовНУ1_Type | Edm.String | true |
| СубконтоРасходовНУ2_Type | Edm.String | true |
| СубконтоРасходовНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыРеализации]] — НДСВидОперацииРеализации
- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[Catalog_СтавкиНДС]] — СтавкаНДС
- [[ChartOfAccounts_Налоговый]] — СчетДоходовНУ
- [[ChartOfAccounts_Налоговый]] — СчетРасходовНУ
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетРасходовБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаНДСПоРеализации
