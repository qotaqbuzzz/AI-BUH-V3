---
category: InformationRegister
properties: 32
relations: 0
---

# InformationRegister_СведенияОПользователях

**Category:** InformationRegister  
**Properties:** 32  
**Relations:** 0

## Properties

| Name | Type | Nullable |
|------|------|----------|
| Пользователь | Edm.String | false |
| ПотребоватьСменуПароляПриВходе | Edm.Boolean | true |
| СрокДействияНеОграничен | Edm.Boolean | true |
| СрокДействия | Edm.DateTime | true |
| ПросрочкаРаботыВПрограммеДоЗапрещенияВхода | Edm.Int16 | true |
| ДатаРазрешенияВходаВПрограмму | Edm.DateTime | true |
| ДатаПоследнейАктивности | Edm.DateTime | true |
| ДатаАвтоматическогоЗапрещенияВхода | Edm.DateTime | true |
| УдалитьДатаНачалаИспользованияПароля | Edm.DateTime | true |
| УдалитьИспользованныеПароли_Base64Data | Edm.Binary | true |
| ПоследнийИспользуемыйКлиент | Edm.String | true |
| НомерКартинкиСостояния | Edm.Int16 | true |
| ВходВПрограммуРазрешен | Edm.Boolean | true |
| ВходВПрограммуОграничен | Edm.Boolean | true |
| НетПрав | Edm.Boolean | true |
| НедостаточноПравДляВхода | Edm.Boolean | true |
| Имя | Edm.String | true |
| АдресЭлектроннойПочты | Edm.String | true |
| АутентификацияСтандартная | Edm.Boolean | true |
| ЗапрещеноИзменятьПароль | Edm.Boolean | true |
| ЗапрещеноВосстанавливатьПароль | Edm.Boolean | true |
| ПоказыватьВСпискеВыбора | Edm.Boolean | true |
| АутентификацияOpenID | Edm.Boolean | true |
| АутентификацияOpenIDConnect | Edm.Boolean | true |
| АутентификацияТокеномДоступа | Edm.Boolean | true |
| АутентификацияОС | Edm.Boolean | true |
| ПользовательОС | Edm.String | true |
| Язык | Edm.String | true |
| ЗащитаОтОпасныхДействий | Edm.Boolean | true |
| Пользователь_Type | Edm.String | false |
| УдалитьИспользованныеПароли_Type | Edm.String | true |
| УдалитьИспользованныеПароли | Edm.Stream | true |
