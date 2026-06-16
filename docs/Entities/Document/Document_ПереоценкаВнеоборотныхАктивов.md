---
category: Document
properties: 45
relations: 10
---

# Document_ПереоценкаВнеоборотныхАктивов

**Category:** Document  
**Properties:** 45  
**Relations:** 10

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
| ВидУчетаНУ_Key | Edm.Guid | true |
| Комментарий | Edm.String | true |
| МетодПереоценки | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| Ответственный_Key | Edm.Guid | true |
| РучнаяКорректировка | Edm.Boolean | true |
| СобытиеОС_Key | Edm.Guid | true |
| СубконтоДоходовБУ1 | Edm.String | true |
| СубконтоДоходовБУ2 | Edm.String | true |
| СубконтоДоходовБУ3 | Edm.String | true |
| СубконтоДоходовНУ1 | Edm.String | true |
| СубконтоДоходовНУ2 | Edm.String | true |
| СубконтоДоходовНУ3 | Edm.String | true |
| СубконтоРасходовБУ1 | Edm.String | true |
| СубконтоРасходовБУ2 | Edm.String | true |
| СубконтоРасходовБУ3 | Edm.String | true |
| СубконтоРасходовНУ1 | Edm.String | true |
| СубконтоРасходовНУ2 | Edm.String | true |
| СубконтоРасходовНУ3 | Edm.String | true |
| СчетДоходовБУ_Key | Edm.Guid | true |
| СчетДоходовНУ_Key | Edm.Guid | true |
| СчетРасходовБУ_Key | Edm.Guid | true |
| СчетРасходовНУ_Key | Edm.Guid | true |
| УчитыватьКПН | Edm.Boolean | true |
| СтруктурноеПодразделение_Key | Edm.Guid | true |
| ОС | Document_ПереоценкаВнеоборотныхАктивов_ОС_RowType | true |
| СубконтоДоходовБУ1_Type | Edm.String | true |
| СубконтоДоходовБУ2_Type | Edm.String | true |
| СубконтоДоходовБУ3_Type | Edm.String | true |
| СубконтоДоходовНУ1_Type | Edm.String | true |
| СубконтоДоходовНУ2_Type | Edm.String | true |
| СубконтоДоходовНУ3_Type | Edm.String | true |
| СубконтоРасходовБУ1_Type | Edm.String | true |
| СубконтоРасходовБУ2_Type | Edm.String | true |
| СубконтоРасходовБУ3_Type | Edm.String | true |
| СубконтоРасходовНУ1_Type | Edm.String | true |
| СубконтоРасходовНУ2_Type | Edm.String | true |
| СубконтоРасходовНУ3_Type | Edm.String | true |

## Related Entities

- [[Catalog_ВидыУчетаНУ]] — ВидУчетаНУ
- [[Catalog_Организации]] — Организация
- [[Catalog_ПодразделенияОрганизаций]] — СтруктурноеПодразделение
- [[Catalog_Пользователи]] — Автор
- [[Catalog_Пользователи]] — Ответственный
- [[Catalog_СобытияОС]] — СобытиеОС
- [[ChartOfAccounts_Налоговый]] — СчетДоходовНУ
- [[ChartOfAccounts_Налоговый]] — СчетРасходовНУ
- [[ChartOfAccounts_Типовой]] — СчетДоходовБУ
- [[ChartOfAccounts_Типовой]] — СчетРасходовБУ
