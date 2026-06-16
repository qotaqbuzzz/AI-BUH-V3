---
category: Catalog
properties: 4
relations: 1
---

# Catalog_ДоговорыЭквайринга_ТарифыЗаРасчетноеОбслуживание

**Category:** Catalog  
**Properties:** 4  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| ВидОплаты_Key | Edm.Guid | true |
| ПроцентТорговойУступки | Edm.Double | true |

## Related Entities

- [[Catalog_ВидыОплатЭквайринга]] — ВидОплаты
