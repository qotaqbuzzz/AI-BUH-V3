---
category: Document
properties: 15
relations: 5
---

# Document_ПринятиеКУчетуНМА_НМА

**Category:** Document  
**Properties:** 15  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| НематериальныйАктив_Key | Edm.Guid | true |
| СтоимостьБУ | Edm.Double | true |
| НачислятьАмортизациюБУ | Edm.Boolean | true |
| СрокПолезногоИспользованияБУ | Edm.Int16 | true |
| СпособНачисленияАмортизацииБУ | Edm.String | true |
| ОбъемПродукцииРаботДляВычисленияАмортизацииБУ | Edm.Int64 | true |
| СпособОтраженияРасходовПоАмортизацииБУ_Key | Edm.Guid | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетНачисленияАмортизацииБУ_Key | Edm.Guid | true |
| ПризнакФиксированногоАктива | Edm.Boolean | true |
| ГруппаНУ_Key | Edm.Guid | true |
| ПорядокПогашенияСтоимостиНУ | Edm.String | true |
| ОбъектИмущественногоНалога | Edm.Boolean | true |

## Related Entities

- [[Catalog_ГруппыНалоговогоУчетаФА]] — ГруппаНУ
- [[Catalog_НематериальныеАктивы]] — НематериальныйАктив
- [[Catalog_СпособыОтраженияРасходовПоАмортизации]] — СпособОтраженияРасходовПоАмортизацииБУ
- [[ChartOfAccounts_Типовой]] — СчетНачисленияАмортизацииБУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
