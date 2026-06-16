---
category: Catalog
properties: 29
relations: 2
---

# Catalog_ИсточникиПроисхождения

**Category:** Catalog  
**Properties:** 29  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| КодТНВЭД | Edm.String | true |
| ГСВС_Key | Edm.Guid | true |
| НомерПозицииВДекларацииИлиЗаявлении | Edm.String | true |
| ДатаСертификатаПроисхожденияТовара | Edm.DateTime | true |
| Номенклатура | Edm.String | true |
| ТоварНаименованиеВРамкахТС | Edm.String | true |
| МеткаТовара | Edm.String | true |
| СтранаПроисхожденияТовара_Key | Edm.Guid | true |
| ТипПроисхождения | Edm.String | true |
| ТипПошлины | Edm.String | true |
| ДокументПартии | Edm.String | true |
| Комментарий | Edm.String | true |
| НомерЗаявленияВРамкахТС | Edm.String | true |
| ДополнительныйИдентификатор | Edm.Int64 | true |
| ПинКод | Edm.String | true |
| Крепость | Edm.Double | true |
| ПризнакУчетаНаВиртуальномСкладе | Edm.Boolean | true |
| GTIN | Edm.String | true |
| НомерПервичнойСНТ | Edm.String | true |
| НомерПозицииИзПервичнойСНТ | Edm.String | true |
| ГСВСТоварПартии | Edm.String | true |
| Номенклатура_Type | Edm.String | true |
| ДокументПартии_Type | Edm.String | true |

## Related Entities

- [[Catalog_КлассификаторСтранМира]] — СтранаПроисхожденияТовара
- [[Catalog_НоменклатураГСВС]] — ГСВС
