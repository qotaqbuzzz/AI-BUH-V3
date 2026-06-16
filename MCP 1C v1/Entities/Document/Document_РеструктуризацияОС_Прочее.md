---
category: Document
properties: 18
relations: 2
---

# Document_РеструктуризацияОС_Прочее

**Category:** Document  
**Properties:** 18  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Сумма | Edm.Double | true |
| СчетСписанияБУ_Key | Edm.Guid | true |
| СубконтоСписанияБУ1 | Edm.String | true |
| СубконтоСписанияБУ2 | Edm.String | true |
| СубконтоСписанияБУ3 | Edm.String | true |
| СчетСписанияНУ_Key | Edm.Guid | true |
| СубконтоСписанияНУ1 | Edm.String | true |
| СубконтоСписанияНУ2 | Edm.String | true |
| СубконтоСписанияНУ3 | Edm.String | true |
| СуммаНУ | Edm.Double | true |
| СубконтоСписанияБУ1_Type | Edm.String | true |
| СубконтоСписанияБУ2_Type | Edm.String | true |
| СубконтоСписанияБУ3_Type | Edm.String | true |
| СубконтоСписанияНУ1_Type | Edm.String | true |
| СубконтоСписанияНУ2_Type | Edm.String | true |
| СубконтоСписанияНУ3_Type | Edm.String | true |

## Related Entities

- [[ChartOfAccounts_Налоговый]] — СчетСписанияНУ
- [[ChartOfAccounts_Типовой]] — СчетСписанияБУ
