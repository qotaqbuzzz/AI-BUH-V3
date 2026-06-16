/**
 * MCP-инструменты для расследования платежей.
 *
 * Два инструмента заменяют 8-10 ручных запросов:
 *
 *   onec_investigate_payment
 *     Полный анализ одного платёжного документа:
 *     документ → счёт списания → контрагент → сотрудник → ведомость
 *
 *   onec_find_duplicate_payments
 *     Найти все дубли за период с именами контрагентов и сотрудников,
 *     уровнем риска и рекомендацией
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InvestigationService } from "@aibos/services";
import { ok, wrapError } from "./utils.js";

export function registerInvestigationTools(
  server:  McpServer,
  service: InvestigationService,
): void {

  // ── Полное расследование одного платежа ──────────────────────

  server.tool(
    "onec_investigate_payment",
    "Полный анализ одного платёжного поручения за один вызов. "
    + "Возвращает: счёт списания (номер + банк), получатель (имя + ИНН), "
    + "сотрудник (ФИО + дата рождения если выплата ЗП/премии), "
    + "статус ведомости, уровень риска и вердикт. "
    + "Заменяет 8-10 ручных запросов при расследовании подозрительного платежа.",
    {
      docNumber: z.string().min(1).max(100).describe("Номер документа в 1С, например «БК000000179»"),
      docDate:   z.string().describe("Дата документа YYYY-MM-DD"),
      orgGuid:   z.string().uuid().describe("GUID организации"),
    },
    async ({ docNumber, docDate, orgGuid }) => {
      try {
        const result = await service.investigatePayment(docNumber, docDate, orgGuid);
        return ok(result);
      } catch (e) {
        return wrapError(e);
      }
    },
  );

  // ── Поиск дублей с полной расшифровкой ───────────────────────

  server.tool(
    "onec_find_duplicate_payments",
    "Найти все дублирующие платежи за период. "
    + "Для каждой пары: имя контрагента, назначения обоих документов, "
    + "один ли счёт списания, один ли сотрудник-получатель (если ЗП), "
    + "уровень риска (high/medium) и конкретная рекомендация. "
    + "Использует windowHours для определения временного окна дубля (по умолчанию 24ч).",
    {
      orgGuid:      z.string().uuid().describe("GUID организации"),
      dateFrom:     z.string().describe("Начало периода YYYY-MM-DD"),
      dateTo:       z.string().describe("Конец периода YYYY-MM-DD"),
      windowHours:  z.number().min(1).max(168).optional().default(24)
                     .describe("Окно поиска дублей в часах (по умолчанию 24)"),
      onlyHighRisk: z.boolean().optional().default(false)
                     .describe("Вернуть только пары с высоким риском"),
    },
    async ({ orgGuid, dateFrom, dateTo, windowHours, onlyHighRisk }) => {
      try {
        let pairs = await service.findDuplicatePairs(orgGuid, dateFrom, dateTo, windowHours!);
        if (onlyHighRisk) pairs = pairs.filter(p => p.riskLevel === "high");
        return ok({
          total:     pairs.length,
          highRisk:  pairs.filter(p => p.riskLevel === "high").length,
          mediumRisk:pairs.filter(p => p.riskLevel === "medium").length,
          totalAmount: pairs.reduce((s, p) => s + p.amount, 0),
          pairs,
        });
      } catch (e) {
        return wrapError(e);
      }
    },
  );
}
