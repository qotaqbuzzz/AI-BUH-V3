/**
 * ui-text.mjs — All static UI strings in one place.
 *
 * Ported from accountant_bot/bot/ui_text.py and consolidated
 * from inline strings in bot.mjs so copy changes live here only.
 */

// ── Thinking messages ─────────────────────────────────────────────────────────

export const THINKING_MESSAGES = [
  "🧮 Суммирую дебеты и кредиты...",
  "📊 Прогоняю через главную книгу...",
  "📋 Листаю финансовые записи...",
  "🖥️ Компилирую финансовую реальность...",
  "🔍 Рыщу по записям...",
  "📎 Скрепляю дебет с кредитом...",
  "🧾 Считаю первичку...",
  "⚙️ Запускаю расчёт...",
  "🔄 Обрабатываю запрос...",
  "☕ Завариваю чай, пока думаю...",
  "📐 Свожу баланс до последней копейки...",
  "💼 Надеваю бухгалтерскую шляпу...",
  "📉 Молюсь, чтоб баланс сошёлся...",
  "🏦 Проверяю, не убежали ли деньги...",
  "📁 Перебираю записи...",
  "🔢 Спрашиваю у главного бухгалтера с Юпитера...",
  "💾 Загружаю данные из базы...",
  "⚡ Считаю со скоростью света...",
  "🔐 Проверяю цифры...",
  "🐢 Думаю... это абсолютно нормально...",
];

/** Returns a random thinking status message. */
export function thinking() {
  return THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)];
}
