---
category: Document
properties: 18
relations: 6
---

# Document_ВедомостьНаПеречислениеПрочихВыплат

**Category:** Document  
**Properties:** 18  
**Relations:** 6

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| DataVersion | Edm.String | true |
| Number | Edm.String | true |
| Date | Edm.DateTime | true |
| DeletionMark | Edm.Boolean | true |
| Posted | Edm.Boolean | true |
| Автор_Key | Edm.Guid | true |
| ВидПрочихВыплат_Key | Edm.Guid | true |
| Контрагент_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПериодВзаиморасчетов | Edm.DateTime | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| СпособРасчетаСуммКПеречислению | Edm.String | true |
| СуммаДокумента | Edm.Double | true |
| ПрочиеВыплаты | Document_ВедомостьНаПеречислениеПрочихВыплат_ПрочиеВыплаты_RowType | true |

## Related Entities

- [[Catalog_ВидыПрочихВыплат]] — ВидПрочихВыплат
- [[Catalog_Контрагенты]] — Контрагент
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
