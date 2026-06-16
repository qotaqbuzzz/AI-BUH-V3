---
category: Document
properties: 8
relations: 3
---

# Document_УвольнениеИзОрганизаций_РаботникиОрганизации

**Category:** Document  
**Properties:** 8  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| LineNumber | Edm.Int64 | false |
| Сотрудник_Key | Edm.Guid | true |
| Физлицо_Key | Edm.Guid | true |
| ДатаУвольнения | Edm.DateTime | true |
| СтатьяЗаконаОТрудеРК_Key | Edm.Guid | true |
| РеквизитыДокументаОснования | Edm.String | true |
| ПрекращатьСтандартныеВычеты | Edm.Boolean | true |

## Related Entities

- [[Catalog_ОснованияУвольненияИзОрганизации]] — СтатьяЗаконаОТрудеРК
- [[Catalog_СотрудникиОрганизаций]] — Сотрудник
- [[Catalog_ФизическиеЛица]] — Физлицо
