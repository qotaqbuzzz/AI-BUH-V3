---
category: Document
properties: 17
relations: 6
---

# Document_ОтражениеНалоговойОтчетностиВРеглУчете

**Category:** Document  
**Properties:** 17  
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
| Комментарий | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| СуммаДокумента | Edm.Double | true |
| РучнаяКорректировка | Edm.Boolean | true |
| ДокументОснование_Key | Edm.Guid | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ОтражениеВУчете | Document_ОтражениеНалоговойОтчетностиВРеглУчете_ОтражениеВУчете_RowType | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Document_РегламентированныйОтчет]] — ДокументОснование
