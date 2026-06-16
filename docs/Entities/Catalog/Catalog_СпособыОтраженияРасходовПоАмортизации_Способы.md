---
category: Catalog
properties: 10
relations: 1
---

# Catalog_СпособыОтраженияРасходовПоАмортизации_Способы

**Category:** Catalog  
**Properties:** 10  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| СчетЗатрат_Key | Edm.Guid | true |
| Субконто1 | Edm.String | true |
| Субконто2 | Edm.String | true |
| Субконто3 | Edm.String | true |
| Коэффициент | Edm.Double | true |
| Субконто1_Type | Edm.String | true |
| Субконто2_Type | Edm.String | true |
| Субконто3_Type | Edm.String | true |

## Related Entities

- [[ChartOfAccounts_Типовой]] — СчетЗатрат
