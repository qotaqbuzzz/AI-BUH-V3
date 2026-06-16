---
category: Document
properties: 11
relations: 1
---

# Document_ИзменениеПараметровНачисленияАмортизацииОС_ОС

**Category:** Document  
**Properties:** 11  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ОсновноеСредство_Key | Edm.Guid | true |
| СрокПолезногоИспользованияБУ | Edm.Int16 | true |
| СрокИспользованияДляВычисленияАмортизацииБУ | Edm.Int16 | true |
| ОбъемПродукцииРаботБУ | Edm.Int64 | true |
| ОбъемПродукцииРаботДляВычисленияАмортизацииБУ | Edm.Int64 | true |
| СтоимостьДляВычисленияАмортизацииБУ | Edm.Double | true |
| КоэффициентАмортизацииБУ | Edm.Double | true |
| КоэффициентУскоренияБУ | Edm.Double | true |
| ЛиквидационнаяСтоимостьБУ | Edm.Double | true |

## Related Entities

- [[Catalog_ОсновныеСредства]] — ОсновноеСредство
