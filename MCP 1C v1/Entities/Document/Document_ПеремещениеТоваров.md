---
category: Document
properties: 21
relations: 8
---

# Document_ПеремещениеТоваров

**Category:** Document  
**Properties:** 21  
**Relations:** 8

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
| ДокументОснование | Edm.String | true |
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СкладОтправитель_Key | Edm.Guid | true |
| СкладПолучатель_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СтруктурноеПодразделениеОтправитель_Key | Edm.Guid | true |
| СтруктурноеПодразделениеПолучатель_Key | Edm.Guid | true |
| Товары | Document_ПеремещениеТоваров_Товары_RowType | true |
| НомераГТД | Document_ПеремещениеТоваров_НомераГТД_RowType | true |
| ДокументОснование_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеОтправитель
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделениеПолучатель
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — СкладОтправитель
- [[Catalog_Склады]] — СкладПолучатель
