---
category: Catalog
properties: 17
relations: 2
---

# Catalog_НомераГТД

**Category:** Catalog  
**Properties:** 17  
**Relations:** 2

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Ref_Key | Edm.Guid | false |
| Predefined | Edm.Boolean | true |
| PredefinedDataName | Edm.String | true |
| DataVersion | Edm.String | true |
| Description | Edm.String | true |
| Code | Edm.String | true |
| DeletionMark | Edm.Boolean | true |
| Комментарий | Edm.String | true |
| СтранаПроисхожденияТовара_Key | Edm.Guid | true |
| КодТНВЭД | Edm.String | true |
| СпособПроисхожденияТовара | Edm.String | true |
| ДатаСертификатаПроисхожденияТовара | Edm.DateTime | true |
| НомерСтрокиГТД | Edm.String | true |
| РегистрационныйНомерЭСФ | Edm.String | true |
| НаименованиеТовара | Edm.String | true |
| ПризнакПроисхождения | Edm.String | true |
| ГСВС_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_КлассификаторСтранМира]] — СтранаПроисхожденияТовара
- [[Catalog_НоменклатураГСВС]] — ГСВС
