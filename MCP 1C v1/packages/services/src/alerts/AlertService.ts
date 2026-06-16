import type { AnomalyReport } from "../ReportsService.js";

/**
 * Sends anomaly alerts to a Telegram chat or generic webhook.
 * Configure via ALERT_TELEGRAM_TOKEN + ALERT_TELEGRAM_CHAT_ID, or ALERT_WEBHOOK_URL.
 * No-op if unconfigured — callers wrap dispatch() in .catch(() => {}).
 */
export class AlertService {
  private readonly webhookUrl = process.env.ALERT_WEBHOOK_URL;
  private readonly tgToken    = process.env.ALERT_TELEGRAM_TOKEN;
  private readonly tgChatId   = process.env.ALERT_TELEGRAM_CHAT_ID;

  async dispatch(report: AnomalyReport): Promise<void> {
    if (this.webhookUrl) {
      await fetch(this.webhookUrl, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(report),
      });
      return;
    }

    if (this.tgToken && this.tgChatId) {
      const { manual, round, unposted } = report.summary;
      const text =
        `⚠️ AI BUH аномалии\n` +
        `Ручные проводки: ${manual} | Круглые суммы: ${round} | Непроведённые: ${unposted}`;

      await fetch(`https://api.telegram.org/bot${this.tgToken}/sendMessage`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ chat_id: this.tgChatId, text }),
      });
    }
  }
}
