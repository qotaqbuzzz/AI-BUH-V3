---
category: Document
properties: 26
relations: 12
---

# Document_КомплектацияНоменклатуры

**Category:** Document  
**Properties:** 26  
**Relations:** 12

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
| ВидОперации | Edm.String | true |
| ЕдиницаИзмерения_Key | Edm.Guid | true |
| Количество | Edm.Double | true |
| Комментарий | Edm.String | true |
| Коэффициент | Edm.Double | true |
| Номенклатура_Key | Edm.Guid | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| Склад_Key | Edm.Guid | true |
| СчетУчетаБУ_Key | Edm.Guid | true |
| СчетУчетаНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| ВидУчетаНУ_Key | Edm.Guid | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| НомерГТД_Key | Edm.Guid | true |
| ДоговорЗакупа_Key | Edm.Guid | true |
| Комплектующие | Document_КомплектацияНоменклатуры_Комплектующие_RowType | true |
| НомераГТД | Document_КомплектацияНоменклатуры_НомераГТД_RowType | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_ДоговорыКонтрагентов]] — ДоговорЗакупа
- [[Catalog_КлассификаторЕдиницИзмерения]] — ЕдиницаИзмерения
- [[Catalog_Номенклатура]] — Номенклатура
- [[Catalog_НомераГТД]] — НомерГТД
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_Склады]] — Склад
- [[ChartOfAccounts_Налоговый]] — СчетУчетаНУ
- [[ChartOfAccounts_Типовой]] — СчетУчетаБУ
