---
category: Document
properties: 21
relations: 6
---

# Document_ВводНачальныхОстатковПоЗарплате

**Category:** Document  
**Properties:** 21  
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
| КраткийСоставДокумента | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| ПодразделениеОрганизации_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| ОтражатьВБухгалтерскомУчете | Edm.Boolean | true |
| УчитыватьКПН | Edm.Boolean | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ЗарплатаИНалоги | Document_ВводНачальныхОстатковПоЗарплате_ЗарплатаИНалоги_RowType | true |
| ВзносыИОтчисления | Document_ВводНачальныхОстатковПоЗарплате_ВзносыИОтчисления_RowType | true |
| ОПВПодлежитПеречислению | Document_ВводНачальныхОстатковПоЗарплате_ОПВПодлежитПеречислению_RowType | true |
| ФизическиеЛица | Document_ВводНачальныхОстатковПоЗарплате_ФизическиеЛица_RowType | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — ПодразделениеОрганизации
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
