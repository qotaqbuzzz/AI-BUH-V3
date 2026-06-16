---
category: Catalog
properties: 28
relations: 3
---

# Catalog_ПодключаемоеОборудование

**Category:** Catalog  
**Properties:** 28  
**Relations:** 3

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| ТипОборудования | Edm.String | true |
| ИдентификаторУстройства | Edm.String | true |
| УстройствоИспользуется | Edm.Boolean | true |
| ДрайверОборудования_Key | Edm.Guid | true |
| Параметры_Base64Data | Edm.Binary | true |
| РабочееМесто_Key | Edm.Guid | true |
| ТребуетсяПереустановка | Edm.Boolean | true |
| ТребуетсяУстановка | Edm.Boolean | true |
| СерийныйНомер | Edm.String | true |
| УдалитьОбработчикДрайвера | Edm.String | true |
| ИдентификаторWebСервисОборудования | Edm.String | true |
| УдалитьВерсияФорматаОбмена | Edm.Int64 | true |
| ВидТранспортаОфлайнОбмена | Edm.String | true |
| Организация_Key | Edm.Guid | true |
| СпособФорматноЛогическогоКонтроля | Edm.String | true |
| ДопустимоеРасхождениеФорматноЛогическогоКонтроля | Edm.Double | true |
| ТипОфлайнОборудования | Edm.String | true |
| ВыводитьПризнакСпособаРасчета | Edm.Boolean | true |
| ВыводитьПризнакПредметаРасчета | Edm.Boolean | true |
| ПараметрыРегистрации | Catalog_ПодключаемоеОборудование_ПараметрыРегистрации_RowType | true |
| Параметры_Type | Edm.String | true |
| Параметры | Edm.Stream | true |

## Related Entities

- [[Catalog_ДрайверыОборудования]] — ДрайверОборудования
- [[Catalog_Организации]] — Организация
- [[Catalog_РабочиеМеста]] — РабочееМесто
