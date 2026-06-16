---
category: Document
properties: 8
relations: 3
---

# Document_ПеремещениеТоваров_НомераГТД

**Category:** Document  
**Properties:** 8  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| КлючСвязи | Edm.Int64 | true |
| УдалитьНоменклатура_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |
| УдалитьКоэффициент | Edm.Double | true |
| Количество | Edm.Double | true |
| НовыйНомерГТД_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Номенклатура]] — УдалитьНоменклатура
- [[Catalog_НомераГТД]] — НовыйНомерГТД
- [[Catalog_НомераГТД]] — НомерГТД
