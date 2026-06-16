---
category: Document
properties: 33
relations: 8
---

# Document_РеструктуризацияОС

**Category:** Document  
**Properties:** 33  
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
| ИсходноеОсновноеСредство_Key | Edm.Guid | true |
| Автор_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Организация_Key | Edm.Guid | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СобытиеОС_Key | Edm.Guid | true |
| Склад_Key | Edm.Guid | true |
| КоэффициентАмортизацииБУ | Edm.Double | true |
| КоэффициентУскоренияБУ | Edm.Double | true |
| СрокПолезногоИспользованияБУ | Edm.Int16 | true |
| ОбъемПродукцииРаботБУ | Edm.Int64 | true |
| ФактОбъемПродукцииРаботБУ | Edm.Double | true |
| ФактСрокИспользованияБУ | Edm.Int16 | true |
| СтоимостьЧастичногоСписания | Edm.Double | true |
| АмортизацияЧастичногоСписания | Edm.Double | true |
| КоэффициентЧастичногоСписания | Edm.Double | true |
| СтоимостьЧастичногоСписанияНУ | Edm.Double | true |
| СнятьСУчетаПоНалогам | Edm.Boolean | true |
| ВидОперации | Edm.String | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ЛиквидационнаяСтоимостьЧастичногоСписания | Edm.Double | true |
| ОС | Document_РеструктуризацияОС_ОС_RowType | true |
| Товары | Document_РеструктуризацияОС_Товары_RowType | true |
| Прочее | Document_РеструктуризацияОС_Прочее_RowType | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ОсновныеСредства]] — ИсходноеОсновноеСредство
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[Catalog_СобытияОС]] — СобытиеОС
