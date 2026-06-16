---
category: Document
properties: 21
relations: 2
---

# Document_МодернизацияОС_ОС

**Category:** Document  
**Properties:** 21  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| АмортизацияБУ | Edm.Double | true |
| АмортизацияЗаМесяцБУ | Edm.Double | true |
| КоэффициентАмортизацииБУ | Edm.Double | true |
| КоэффициентУскоренияБУ | Edm.Double | true |
| ОбъемПродукцииРаботБУ | Edm.Int64 | true |
| ОсновноеСредство_Key | Edm.Guid | true |
| СрокПолезногоИспользованияБУ | Edm.Int16 | true |
| СтоимостьБУ | Edm.Double | true |
| СуммаМодернизацииБУ | Edm.Double | true |
| ФактОбъемПродукцииРаботБУ | Edm.Double | true |
| ФактСрокИспользованияБУ | Edm.Int16 | true |
| СчетНУ_Key | Edm.Guid | true |
| СубконтоНУ1 | Edm.String | true |
| СубконтоНУ2 | Edm.String | true |
| СубконтоНУ3 | Edm.String | true |
| ЛиквидационнаяСтоимостьБУ | Edm.Double | true |
| СубконтоНУ1_Type | Edm.String | true |
| СубконтоНУ2_Type | Edm.String | true |
| СубконтоНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
- [[ChartOfAccounts_Налоговый]] — СчетНУ
