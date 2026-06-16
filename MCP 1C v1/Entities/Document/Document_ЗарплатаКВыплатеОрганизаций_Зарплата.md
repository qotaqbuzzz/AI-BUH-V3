---
category: Document
properties: 9
relations: 2
---

# Document_ЗарплатаКВыплатеОрганизаций_Зарплата

**Category:** Document  
**Properties:** 9  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Физлицо_Key | Edm.Guid | true |
| Сумма | Edm.Double | true |
| ДепонированнаяСумма | Edm.Double | true |
| ВыплаченностьЗарплаты | Edm.String | true |
| СуммаКВыплате | Edm.Double | true |
| Авторасчет | Edm.Boolean | true |
| НомерКартСчета_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_КартСчета]] — НомерКартСчета
- [[Catalog_ФизическиеЛица]] — Физлицо
