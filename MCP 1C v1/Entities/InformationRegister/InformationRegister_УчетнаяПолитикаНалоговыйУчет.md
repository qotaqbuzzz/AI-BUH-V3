---
category: InformationRegister
properties: 41
relations: 5
---

# InformationRegister_УчетнаяПолитикаНалоговыйУчет

**Category:** InformationRegister  
**Properties:** 41  
**Relations:** 5

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Period | Edm.DateTime | false |
| Организация_Key | Edm.Guid | false |
| НДСНалоговыйПериод | Edm.String | true |
| НДСМетодОтнесенияВЗачет | Edm.String | true |
| ОрганизацияЯвляетсяПлательщикомНДС | Edm.Boolean | true |
| ОрганизацияЯвляетсяПлательщикомКПН | Edm.Boolean | true |
| ОрганизацияЯвляетсяПлательщикомАкциза | Edm.Boolean | true |
| ОрганизацияЯвляетсяПлательщикомСН | Edm.Boolean | true |
| УпрощенныйУчетИПНиОПВ | Edm.Boolean | true |
| ОтражениеПоПериодуРегистрации | Edm.Boolean | true |
| ЗасчитыватьВВыплаченныеДоходыУдержанияПоИЛ | Edm.Boolean | true |
| КоэффициентМРПДляРасчетаСНЗаИндивидуальногоПредпринимателя | Edm.Double | true |
| КоэффициентМРПДляРасчетаСНЗаНаемногоРаботника | Edm.Double | true |
| ПрименятьОграничениеНаМинимальнуюБазуСоциальногоНалога | Edm.Boolean | true |
| ПорядокСписанияЗадолженностиПоЗарплате | Edm.String | true |
| РаспределятьНалогиПоСтруктурнымЕдиницам | Edm.Boolean | true |
| РаспределятьНалогиПоПодразделениямОрганизаций | Edm.Boolean | true |
| ОрганизацияЯвляетсяВкладчикомОППВ | Edm.Boolean | true |
| ПрименятьОграничениеНаМинимальныйОбъектОСМС | Edm.Boolean | true |
| ЕжемесячныйРасчетВзносовИОтчисленийЗаИП | Edm.Boolean | true |
| ПорядокРасчетаДоходаОПВ | Edm.String | true |
| РазмерДоходаОПВ | Edm.Double | true |
| ПорядокРасчетаДоходаСО | Edm.String | true |
| РазмерДоходаСО | Edm.Double | true |
| ПредоставлятьВычетВМесяцеОтсутствияДохода | Edm.Boolean | true |
| СпособОтраженияОПВИП_Key | Edm.Guid | true |
| СпособОтраженияСОИП_Key | Edm.Guid | true |
| РежимНалогообложения | Edm.String | true |
| СтавкаВОСМСДляИП | Edm.Double | true |
| СпособОтраженияВОСМСИП_Key | Edm.Guid | true |
| РазмерДоходаВОСМС | Edm.Double | true |
| ПорядокРасчетаДоходаВОСМС | Edm.String | true |
| НеПрименятьКорректировкуПрочихНалоговВзносовОтчислений | Edm.Boolean | true |
| ПрименятьВычетВОСМСДляФизическихЛицИГПХ | Edm.Boolean | true |
| СтавкаОПВдляИП | Edm.Double | true |
| СтавкаСОДляИП | Edm.Double | true |
| ПрименятьВычетОПВиВОСМСДляГПХ | Edm.Boolean | true |
| ПорядокОбложенияДоходовРаботников | Edm.String | true |
| СуммаЗаявленногоДоходаИП | Edm.Double | true |
| СтавкаОПВРдляИП | Edm.Double | true |
| СпособОтраженияОПВРИП_Key | Edm.Guid | true |

## Related Entities

- [[Catalog_Организации]] — Организация
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияВОСМСИП
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияОПВИП
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияОПВРИП
- [[Catalog_СпособыОтраженияЗарплатыВРеглУчете]] — СпособОтраженияСОИП
