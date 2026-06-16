---
category: Document
properties: 18
relations: 7
---

# Document_РегистрацияПрочихВыплат

**Category:** Document  
**Properties:** 18  
**Relations:** 7

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
| Комментарий | Edm.String | true |
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| ВидПрочихВыплат_Key | Edm.Guid | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СпособОтраженияВРеглУчете_Key | Edm.Guid | true |
| ПрочиеВыплаты | Document_РегистрацияПрочихВыплат_ПрочиеВыплаты_RowType | true |

## Related Entities

- [[Catalog_ВидыПрочихВыплат]] — ВидПрочихВыплат
- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВРеглУчете
