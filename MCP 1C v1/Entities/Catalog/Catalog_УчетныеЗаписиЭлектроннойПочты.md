---
category: Catalog
properties: 28
relations: 1
---

# Catalog_УчетныеЗаписиЭлектроннойПочты

**Category:** Catalog  
**Properties:** 28  
**Relations:** 1

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| АдресЭлектроннойПочты | Edm.String | true |
| ВремяОжидания | Edm.Int16 | true |
| ИмяПользователя | Edm.String | true |
| ИспользоватьДляОтправки | Edm.Boolean | true |
| ИспользоватьДляПолучения | Edm.Boolean | true |
| ИспользоватьЗащищенноеСоединениеДляВходящейПочты | Edm.Boolean | true |
| ИспользоватьЗащищенноеСоединениеДляИсходящейПочты | Edm.Boolean | true |
| ОставлятьКопииСообщенийНаСервере | Edm.Boolean | true |
| ПериодХраненияСообщенийНаСервере | Edm.Int16 | true |
| Пользователь | Edm.String | true |
| ПользовательSMTP | Edm.String | true |
| ПортСервераВходящейПочты | Edm.Int64 | true |
| ПортСервераИсходящейПочты | Edm.Int64 | true |
| ПротоколВходящейПочты | Edm.String | true |
| СерверВходящейПочты | Edm.String | true |
| СерверИсходящейПочты | Edm.String | true |
| ТребуетсяВходНаСерверПередОтправкой | Edm.Boolean | true |
| ОтправлятьСкрытыеКопииПисемНаЭтотАдрес | Edm.Boolean | true |
| ВладелецУчетнойЗаписи_Key | Edm.Guid | true |
| ПриОтправкеПисемТребуетсяАвторизация | Edm.Boolean | true |
| АвторизацияСПомощьюПочтовогоСервиса | Edm.Boolean | true |
| ИмяПочтовогоСервиса | Edm.String | true |

## Related Entities

- [[Catalog_Пользователи]] — ВладелецУчетнойЗаписи
