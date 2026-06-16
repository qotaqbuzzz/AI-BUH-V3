/**
 * Генератор документов по шаблонам из данных 1С.
 * Выводит HTML (пригоден для печати, сохранения в PDF через браузер).
 *
 * Документы:
 *  - Акт сверки взаиморасчётов
 *  - Справка о задолженности
 *  - Реестр кредиторской задолженности
 *  - Уведомление о задолженности
 */
function toIsoDate(s) {
    return s;
}
export const DOCUMENT_META = {
    act_sverki: { type: "act_sverki", title: "Reconciliation Act", ruTitle: "Акт сверки взаиморасчётов", extension: "html" },
    debt_certificate: { type: "debt_certificate", title: "Debt Certificate", ruTitle: "Справка о задолженности", extension: "html" },
    creditors_report: { type: "creditors_report", title: "Creditors Report", ruTitle: "Реестр кредиторской задолженности", extension: "html" },
    obligation_notice: { type: "obligation_notice", title: "Obligation Notice", ruTitle: "Уведомление о задолженности", extension: "html" },
};
// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);
const ruDate = (iso) => {
    const [y, m, d] = iso.split("-");
    const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    return `${d} ${months[parseInt(m ?? "1") - 1]} ${y} г.`;
};
const filename = (type, suffix) => `${type}_${suffix}_${today()}.html`;
// ── HTML base layout ───────────────────────────────────────────────────────
function htmlDoc(title, body) {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; background: #fff; padding: 20mm 25mm; }
    @media print { body { padding: 15mm 20mm; } .no-print { display: none; } }
    h1 { font-size: 14pt; text-align: center; text-transform: uppercase; margin-bottom: 4pt; }
    h2 { font-size: 12pt; text-align: center; margin-bottom: 12pt; }
    .subtitle { text-align: center; font-style: italic; margin-bottom: 16pt; font-size: 11pt; }
    p { margin-bottom: 8pt; line-height: 1.5; text-align: justify; }
    table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 11pt; }
    th { background: #f0f0f0; border: 1px solid #333; padding: 5pt 8pt; text-align: center; font-weight: bold; }
    td { border: 1px solid #444; padding: 4pt 8pt; vertical-align: top; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
    td.center { text-align: center; }
    .total-row td { font-weight: bold; background: #f8f8f8; }
    .section { margin: 16pt 0; }
    .org-block { margin: 12pt 0; }
    .sign-block { display: flex; justify-content: space-between; margin-top: 24pt; }
    .sign-col { width: 45%; }
    .sign-line { border-bottom: 1px solid #000; margin: 20pt 0 4pt; width: 60%; }
    .sign-label { font-size: 10pt; color: #333; }
    .stamp-area { border: 1px dashed #999; width: 80pt; height: 80pt; display: inline-block; text-align: center; line-height: 80pt; font-size: 9pt; color: #999; vertical-align: middle; margin-left: 12pt; }
    .meta { font-size: 10pt; color: #555; margin-bottom: 16pt; }
    .red { color: #c00; font-weight: bold; }
    .highlight { background: #fffde7; }
    .divider { border: none; border-top: 1px solid #ccc; margin: 12pt 0; }
    .no-print { background: #e3f2fd; padding: 8pt 12pt; border-radius: 4pt; margin-bottom: 16pt; font-family: Arial, sans-serif; font-size: 10pt; }
  </style>
</head>
<body>
  <div class="no-print">💡 Для сохранения в PDF: Ctrl+P → Сохранить как PDF (Назначение: PDF)</div>
  ${body}
</body>
</html>`;
}
// ── Service ────────────────────────────────────────────────────────────────
export class DocumentGeneratorService {
    reports;
    catalog;
    constructor(reports, catalog) {
        this.reports = reports;
        this.catalog = catalog;
    }
    // ── Акт сверки взаиморасчётов ────────────────────────────────────────────
    async generateActSverki(params) {
        const [balance, paymentsOut, paymentsIn] = await Promise.all([
            this.reports.getContractorBalance(params.contractorGuid, params.dateTo),
            this.reports.getOutgoingPayments(params.dateFrom, params.dateTo, params.contractorGuid, params.orgGuid),
            this.reports.getIncomingPayments(params.dateFrom, params.dateTo, params.contractorGuid, params.orgGuid),
        ]);
        const orgs = await this.catalog.getOrganizations();
        const org = params.orgGuid ? orgs.find(o => o.Ref_Key === params.orgGuid) : orgs[0];
        const orgName = org?.НаименованиеПолное ?? org?.Description ?? "ТОО Агросиндикат Казахстан";
        const contraName = balance.contractorName;
        const rows = [
            ...paymentsOut.rows.map(p => ({ date: p.date, doc: p.number, debit: 0, credit: p.amount, purpose: p.purpose.slice(0, 60) })),
            ...paymentsIn.rows.map(p => ({ date: p.date, doc: p.number, debit: p.amount, credit: 0, purpose: p.purpose.slice(0, 60) })),
        ].sort((a, b) => a.date.localeCompare(b.date));
        const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
        const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
        const netBalance = balance.totals.net;
        const tableRows = rows.map((r, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td class="center">${r.date}</td>
        <td>${r.doc}</td>
        <td>${r.purpose}</td>
        <td class="num">${r.debit > 0 ? fmt(r.debit) : "–"}</td>
        <td class="num">${r.credit > 0 ? fmt(r.credit) : "–"}</td>
      </tr>`).join("");
        const balanceRows = balance.rows.map(r => `
      <tr>
        <td>${r.accountCode}</td>
        <td>${r.accountName}</td>
        <td class="num">${r.balanceDr > 0 ? fmt(r.balanceDr) : "–"}</td>
        <td class="num">${r.balanceCr > 0 ? fmt(r.balanceCr) : "–"}</td>
        <td class="num ${r.net < 0 ? "red" : ""}">${fmt(r.net)}</td>
      </tr>`).join("");
        const closingText = netBalance < 0
            ? `По состоянию на <b>${ruDate(params.dateTo)}</b> задолженность <b>${orgName}</b> перед <b>${contraName}</b> составляет <b class="red">${fmt(-netBalance)} тг</b>.`
            : netBalance > 0
                ? `По состоянию на <b>${ruDate(params.dateTo)}</b> задолженность <b>${contraName}</b> перед <b>${orgName}</b> составляет <b>${fmt(netBalance)} тг</b>.`
                : `По состоянию на <b>${ruDate(params.dateTo)}</b> задолженности между сторонами <b>нет</b>. Взаиморасчёты закрыты.`;
        const body = `
      <h1>Акт сверки взаиморасчётов</h1>
      <h2>за период с ${ruDate(params.dateFrom)} по ${ruDate(params.dateTo)}</h2>
      <div class="subtitle">Составлен в двух экземплярах, имеющих одинаковую юридическую силу</div>

      <div class="section">
        <div class="org-block">
          <p>Мы, нижеподписавшиеся, <b>${orgName}</b> (далее — Сторона 1) и <b>${contraName}</b>
          (далее — Сторона 2), составили настоящий акт о нижеследующем.</p>
        </div>
      </div>

      <div class="section">
        <h2 style="text-align:left;font-size:12pt">Остатки по счетам бухгалтерии</h2>
        <table>
          <thead>
            <tr>
              <th>Счёт</th>
              <th>Наименование</th>
              <th>Дебет</th>
              <th>Кредит</th>
              <th>Сальдо</th>
            </tr>
          </thead>
          <tbody>
            ${balanceRows || "<tr><td colspan='5' class='center'>Нет данных</td></tr>"}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2 style="text-align:left;font-size:12pt">Движение по взаиморасчётам за период</h2>
        <table>
          <thead>
            <tr>
              <th style="width:4%">№</th>
              <th style="width:10%">Дата</th>
              <th style="width:12%">Документ</th>
              <th>Основание</th>
              <th style="width:14%">Поступление</th>
              <th style="width:14%">Оплата</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || "<tr><td colspan='6' class='center'>Движений не найдено</td></tr>"}
            <tr class="total-row">
              <td colspan="4" style="text-align:right">ИТОГО за период:</td>
              <td class="num">${fmt(totalDebit)}</td>
              <td class="num">${fmt(totalCredit)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <p>${closingText}</p>
        <p>Стороны подтверждают отсутствие взаимных претензий по состоянию на дату подписания акта.</p>
      </div>

      <div class="sign-block">
        <div class="sign-col">
          <p><b>Сторона 1:</b></p>
          <p>${orgName}</p>
          <div class="sign-line"></div>
          <p class="sign-label">Подпись / ФИО / Печать</p>
          <span class="stamp-area">М.П.</span>
        </div>
        <div class="sign-col">
          <p><b>Сторона 2:</b></p>
          <p>${contraName}</p>
          <div class="sign-line"></div>
          <p class="sign-label">Подпись / ФИО / Печать</p>
          <span class="stamp-area">М.П.</span>
        </div>
      </div>`;
        return {
            type: "act_sverki",
            title: `Акт сверки — ${contraName}`,
            filename: filename("act_sverki", contraName.replace(/\s+/g, "_").slice(0, 30)),
            html: htmlDoc(`Акт сверки — ${contraName}`, body),
            generatedAt: new Date().toISOString(),
            params,
        };
    }
    // ── Справка о задолженности ──────────────────────────────────────────────
    async generateDebtCertificate(params) {
        const asOf = params.date ?? today();
        const [balance, orgs] = await Promise.all([
            this.reports.getContractorBalance(params.contractorGuid, asOf),
            this.catalog.getOrganizations(),
        ]);
        const org = params.orgGuid ? orgs.find(o => o.Ref_Key === params.orgGuid) : orgs[0];
        const orgName = org?.НаименованиеПолное ?? org?.Description ?? "ТОО Агросиндикат Казахстан";
        const certNum = params.certNumber ?? `Справка-${Date.now().toString().slice(-6)}`;
        const totalOwed = balance.rows.filter(r => r.net < 0).reduce((s, r) => s + Math.abs(r.net), 0);
        const totalOther = balance.rows.filter(r => r.net > 0).reduce((s, r) => s + r.net, 0);
        const debtRows = balance.rows.map(r => {
            const label = r.net < 0 ? "Задолженность нашей стороны" : r.net > 0 ? "Задолженность контрагента" : "Нет задолженности";
            return `
        <tr>
          <td>${r.accountCode}</td>
          <td>${r.accountName}</td>
          <td class="num">${r.balanceDr > 0 ? fmt(r.balanceDr) : "–"}</td>
          <td class="num">${r.balanceCr > 0 ? fmt(r.balanceCr) : "–"}</td>
          <td class="num ${r.net < 0 ? "red" : ""}">${fmt(Math.abs(r.net))}</td>
          <td>${label}</td>
        </tr>`;
        }).join("");
        const conclusionText = totalOwed > 0
            ? `По данным бухгалтерского учёта <b>${orgName}</b>, задолженность перед <b>${balance.contractorName}</b> на ${ruDate(asOf)} составляет <b class="red">${fmt(totalOwed)} тг</b>.`
            : totalOther > 0
                ? `По данным бухгалтерского учёта, <b>${balance.contractorName}</b> имеет задолженность перед <b>${orgName}</b> в размере <b>${fmt(totalOther)} тг</b>.`
                : `По данным бухгалтерского учёта, на ${ruDate(asOf)} задолженности между сторонами <b>не выявлено</b>.`;
        const body = `
      <div style="text-align:right;margin-bottom:16pt">
        <p>${certNum}</p>
        <p>Дата выдачи: ${ruDate(asOf)}</p>
      </div>

      <h1>Справка о состоянии задолженности</h1>
      <div class="subtitle">по расчётам с контрагентом</div>

      <div class="section">
        <table class="meta" style="border:none;width:auto;margin:8pt 0">
          <tr>
            <td style="border:none;padding:2pt 8pt 2pt 0;font-weight:bold">Организация:</td>
            <td style="border:none;padding:2pt 0">${orgName}</td>
          </tr>
          <tr>
            <td style="border:none;padding:2pt 8pt 2pt 0;font-weight:bold">Контрагент:</td>
            <td style="border:none;padding:2pt 0">${balance.contractorName}</td>
          </tr>
          <tr>
            <td style="border:none;padding:2pt 8pt 2pt 0;font-weight:bold">На дату:</td>
            <td style="border:none;padding:2pt 0">${ruDate(asOf)}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <p>Настоящая справка выдана на основании данных бухгалтерского учёта ${orgName} и подтверждает следующее состояние взаиморасчётов:</p>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:8%">Счёт</th>
            <th>Наименование счёта</th>
            <th style="width:14%">Дебет</th>
            <th style="width:14%">Кредит</th>
            <th style="width:14%">Остаток</th>
            <th style="width:22%">Характер</th>
          </tr>
        </thead>
        <tbody>
          ${debtRows || "<tr><td colspan='6' class='center'>Нет данных</td></tr>"}
          <tr class="total-row">
            <td colspan="2" style="text-align:right">ИТОГО:</td>
            <td class="num">${fmt(balance.totals.balanceDr)}</td>
            <td class="num">${fmt(balance.totals.balanceCr)}</td>
            <td class="num ${balance.totals.net < 0 ? "red" : ""}">${fmt(Math.abs(balance.totals.net))}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="section">
        <p>${conclusionText}</p>
        <p>Справка составлена на основании данных программы 1С:Бухгалтерия (Казахстан) и является достоверной на дату выдачи.</p>
      </div>

      <div style="margin-top:32pt">
        <p>Главный бухгалтер: <span class="sign-line" style="display:inline-block;width:120pt;border-bottom:1px solid #000;margin:0 8pt"></span> /_____________/</p>
        <p style="margin-top:12pt">Руководитель: <span style="display:inline-block;width:140pt;border-bottom:1px solid #000;margin:0 8pt"></span> /_____________/</p>
        <p style="margin-top:12pt">М.П. &nbsp;&nbsp; Дата: ${ruDate(today())}</p>
      </div>`;
        return {
            type: "debt_certificate",
            title: `Справка о задолженности — ${balance.contractorName}`,
            filename: filename("debt_certificate", balance.contractorName.replace(/\s+/g, "_").slice(0, 30)),
            html: htmlDoc(`Справка о задолженности — ${balance.contractorName}`, body),
            generatedAt: new Date().toISOString(),
            params,
        };
    }
    // ── Реестр кредиторской задолженности ────────────────────────────────────
    async generateCreditorsReport(params) {
        const asOf = params.date ?? today();
        const [detailed, orgs] = await Promise.all([
            this.reports.getDetailedCreditors(params.orgGuid, asOf),
            this.catalog.getOrganizations(),
        ]);
        const org = params.orgGuid ? orgs.find(o => o.Ref_Key === params.orgGuid) : orgs[0];
        const orgName = org?.НаименованиеПолное ?? org?.Description ?? "ТОО Агросиндикат Казахстан";
        const title = params.title ?? "Реестр кредиторской задолженности";
        const AGE_COLOR = {
            current: "#e8f5e9",
            "1y": "#fff9c4",
            "2y": "#ffe0b2",
            "3y+": "#ffebee",
            unknown: "#fff",
        };
        const rows = detailed.rows.map((r, i) => {
            const bg = AGE_COLOR[r.ageCategory] ?? "#fff";
            const ageLabel = r.ageCategory === "current" ? "< 1 года"
                : r.ageCategory === "1y" ? "1–2 года"
                    : r.ageCategory === "2y" ? "2–3 года"
                        : r.ageCategory === "3y+" ? "3+ лет" : "—";
            const contracts = r.contracts.slice(0, 2).join(", ") || "—";
            const paid = r.totalPaid2024to2026 > 0 ? fmt(r.totalPaid2024to2026) : "—";
            const lastPay = r.lastPaymentDate ?? "—";
            return `
        <tr style="background:${bg}">
          <td class="center">${i + 1}</td>
          <td>${r.contractorName}</td>
          <td class="center">${r.accountCode}</td>
          <td class="num">${fmt(r.balance)}</td>
          <td class="center">${r.firstDocDate ?? "—"}</td>
          <td>${contracts}</td>
          <td class="num">${paid}</td>
          <td class="center">${lastPay}</td>
          <td class="center">${ageLabel}</td>
        </tr>`;
        }).join("");
        const legendItems = [
            { color: "#e8f5e9", label: "< 1 года" },
            { color: "#fff9c4", label: "1–2 года" },
            { color: "#ffe0b2", label: "2–3 года" },
            { color: "#ffebee", label: "3+ лет" },
        ].map(l => `<span style="background:${l.color};border:1px solid #ccc;padding:2pt 8pt;margin-right:6pt;font-size:9pt">${l.label}</span>`).join("");
        const body = `
      <h1>${title}</h1>
      <h2>${orgName}</h2>
      <div class="subtitle">По состоянию на ${ruDate(asOf)}</div>

      <div class="meta">
        <p>Сформирован: ${ruDate(today())} &nbsp;|&nbsp; Кредиторов: ${detailed.rows.length} &nbsp;|&nbsp; Итого: ${fmt(detailed.total)} тг</p>
        <p style="margin-top:4pt">Возраст долга: ${legendItems}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:3%">№</th>
            <th style="width:20%">Кредитор</th>
            <th style="width:6%">Счёт</th>
            <th style="width:13%">Остаток (тг)</th>
            <th style="width:9%">1-й документ</th>
            <th style="width:18%">Договоры</th>
            <th style="width:12%">Оплачено</th>
            <th style="width:9%">Посл. оплата</th>
            <th style="width:8%">Возраст</th>
          </tr>
        </thead>
        <tbody>
          ${rows || "<tr><td colspan='9' class='center'>Кредиторов не найдено</td></tr>"}
          <tr class="total-row">
            <td colspan="3" style="text-align:right">ИТОГО:</td>
            <td class="num">${fmt(detailed.total)}</td>
            <td colspan="5"></td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:24pt">
        <p>Главный бухгалтер: <span style="display:inline-block;width:120pt;border-bottom:1px solid #000;margin:0 8pt"></span></p>
        <p style="margin-top:8pt">Дата: ${ruDate(today())}</p>
      </div>`;
        return {
            type: "creditors_report",
            title: `${title} — ${orgName}`,
            filename: filename("creditors_report", orgName.replace(/\s+/g, "_").slice(0, 20)),
            html: htmlDoc(title, body),
            generatedAt: new Date().toISOString(),
            params,
        };
    }
    // ── Уведомление о задолженности ──────────────────────────────────────────
    async generateObligationNotice(params) {
        const asOf = params.date ?? today();
        const [balance, orgs] = await Promise.all([
            this.reports.getContractorBalance(params.contractorGuid, asOf),
            this.catalog.getOrganizations(),
        ]);
        const org = params.orgGuid ? orgs.find(o => o.Ref_Key === params.orgGuid) : orgs[0];
        const orgName = org?.НаименованиеПолное ?? org?.Description ?? "ТОО Агросиндикат Казахстан";
        const noticeNo = params.noticeNumber ?? `УВ-${Date.now().toString().slice(-6)}`;
        const dueLabel = params.dueDate ? ruDate(params.dueDate) : "в кратчайшие сроки";
        const totalDebt = Math.abs(balance.totals.net);
        const debtDetails = balance.rows
            .filter(r => r.net < 0)
            .map(r => `<li>По счёту <b>${r.accountCode}</b> (${r.accountName}): <b>${fmt(Math.abs(r.net))} тг</b></li>`)
            .join("");
        const body = `
      <div style="text-align:right;margin-bottom:16pt">
        <p>Исх. № ${noticeNo}</p>
        <p>от ${ruDate(today())}</p>
        <p style="margin-top:8pt">Кому: <b>${balance.contractorName}</b></p>
      </div>

      <h1>Уведомление о наличии задолженности</h1>

      <div class="section">
        <p>Уважаемый партнёр,</p>
        <p><b>${orgName}</b> настоящим уведомляет Вас о том, что по данным бухгалтерского учёта
        на <b>${ruDate(asOf)}</b> между нашими организациями числится следующая задолженность:</p>
      </div>

      <ul style="margin: 12pt 0 12pt 24pt; line-height: 1.8">
        ${debtDetails || "<li>Задолженность не найдена</li>"}
      </ul>

      <div class="section">
        <p><b>Итоговая сумма: <span class="red">${fmt(totalDebt)} тг</span></b></p>
      </div>

      <div class="section">
        <p>Просим Вас произвести погашение задолженности <b>${dueLabel}</b>.</p>
        <p>В случае возникновения вопросов или разногласий по суммам задолженности, просим обратиться
        к главному бухгалтеру для проведения сверки взаиморасчётов.</p>
        <p>В случае непогашения задолженности в указанный срок, наша организация оставляет за собой
        право обратиться в судебные органы для взыскания задолженности в принудительном порядке.</p>
      </div>

      <div class="section">
        <p>Настоящее уведомление составлено в соответствии с договорными обязательствами и нормами
        гражданского законодательства Республики Казахстан.</p>
      </div>

      <div style="margin-top:32pt">
        <p>С уважением,</p>
        <p style="margin-top:8pt"><b>${orgName}</b></p>
        <div class="sign-block" style="margin-top:16pt">
          <div class="sign-col">
            <p>Руководитель:</p>
            <div class="sign-line"></div>
            <p class="sign-label">(подпись / ФИО)</p>
          </div>
          <div class="sign-col">
            <p>Главный бухгалтер:</p>
            <div class="sign-line"></div>
            <p class="sign-label">(подпись / ФИО)</p>
          </div>
        </div>
        <p style="margin-top:16pt">М.П.</p>
      </div>`;
        return {
            type: "obligation_notice",
            title: `Уведомление о задолженности — ${balance.contractorName}`,
            filename: filename("obligation_notice", balance.contractorName.replace(/\s+/g, "_").slice(0, 30)),
            html: htmlDoc("Уведомление о задолженности", body),
            generatedAt: new Date().toISOString(),
            params,
        };
    }
}
//# sourceMappingURL=DocumentGeneratorService.js.map