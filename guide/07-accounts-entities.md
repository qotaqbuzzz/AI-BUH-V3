# KZ Account Codes & 1C Entity Reference

## Key account codes (НК РК / KZ IFRS)
```
── Assets ──────────────────────────────────────
1010  Cash (Касса)
1030  Bank accounts (Расчётные счета)
1210  AR — trade receivables (Дебиторы по реализации)
1250  AR — advances to suppliers (Авансы выданные покупателям)
1310  Materials / raw goods (Материалы)
1320  Finished goods (Готовая продукция)
1341  WIP — general (НЗП)
1420  VAT recoverable (НДС к возмещению)
1710  Advances issued (Авансы выданные поставщикам) ← watch for concentration
2410  Fixed assets — initial cost (Первоначальная стоимость ОС)
2420  Accumulated depreciation (Амортизация ОС)

── Liabilities ─────────────────────────────────
3110  CIT payable (КПН к уплате)
3120  IIT payable (ИПН)
3130  VAT payable (НДС к уплате)
3131  VAT accrued on sales (НДС начисленный)
3150  Social tax (Социальный налог)
3210  Social contributions (СО, ВОСМС, ОСМС)
3220  Pension contributions employee (ОПВ)
3250  Pension contributions employer (ОППВ)
3310  AP — trade payables (Кредиторы)
3350  Payroll payable (Зарплата к выплате)
3510  Advances received from buyers (Авансы полученные)
3387  Other payables
4010  Long-term bank loans
4150  Loans from other entities (долгосрочные займы)

── Capital ─────────────────────────────────────
5510  Retained earnings (Нераспределённая прибыль)
5610  Current-year profit (Прибыль текущего периода)

── Income & Expenses ───────────────────────────
6010  Revenue (Выручка от реализации)
7010  COGS (Себестоимость реализации)
7210  Admin overhead (Управленческие расходы)

── Production (Section 8) ──────────────────────
8110  WIP — general production (НЗП)
8112  WIP — crop growing (НЗП растениеводства) ← seasonal
8410  Overhead to allocate
```

## НК РК 2026 tax rates (quick reference)
```
КПН        20%   (agro: −70% per Art.285)
НДС        12%   (formula: base × 12%, NOT × 12/112)
ИПН        10%   (employee income tax)
ОПВ        10%   (employee pension)
ОППВ        5%   (employer pension)
СО          3.5% (social contribution)
ВОСМС       3%   (compulsory health insurance employer)
ООСМС / ОСМС 2% (employee health insurance)
СН          9.5% − СО  (social tax net)
МРП 2026   3,692 ₸
МЗП 2026  85,000 ₸
ИПН deduction: 14 МРП = 51,688 ₸
```

## 1C OData entity naming pattern
```
{Category}_{RussianName}

Category examples:
  Catalog_              → reference books (справочники)
  Document_             → business documents
  AccumulationRegister_ → quantity/amount registers
  InformationRegister_  → info registers (ЭСФ, курсы)
  AccountingRegister_   → Дт/Кт ledger (Типовой)
  ChartOfAccounts_      → chart of accounts
```

## Common entity names
```
Catalog_Контрагенты                → contractors
Catalog_Организации                → organizations
Catalog_Номенклатура               → products/services
Catalog_Склады                     → warehouses
Catalog_ДоговорыКонтрагентов       → contracts
Catalog_Валюты                     → currencies
Document_РеализацияТоваровУслуг    → sales invoice
Document_ПоступлениеТоваровУслуг   → purchase invoice
Document_ПлатежноеПоручениеИсходящее → outgoing payment
Document_НачислениеЗарплаты...     → payroll accrual
Document_ЗакрытиеМесяца           → month-close document
AccountingRegister_Типовой_RecordType → all Дт/Кт postings
InformationRegister_АктуальныеЭСФ → e-invoice register
```

## GUID zero value
```
00000000-0000-0000-0000-000000000000 → empty / not set
// Never pass this as a contractor or org GUID — filter it out
```
