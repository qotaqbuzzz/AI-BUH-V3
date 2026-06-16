/**
 * Tenant registry — CRUD operations for tenants, secrets, users, history, usage.
 *
 * Only imported by the bot parent process.
 * MCP children are never given access to this module or the DB.
 */
import { randomUUID } from "crypto";
import db from "./db.mjs";
import { encrypt, decrypt } from "./crypto.mjs";

// ── Tenant ─────────────────────────────────────────────────────────────────────

/**
 * Create a new tenant and persist its secrets.
 * @param {{ name: string, odataUrl: string, username: string, password: string,
 *           docflowUrl?: string, docflowUser?: string, docflowPass?: string,
 *           plan?: string, trialDays?: number }} opts
 * @returns {{ id: string }} tenant row
 */
export function createTenant({ name, odataUrl, username, password,
    docflowUrl, docflowUser, docflowPass,
    plan = "starter", trialDays }) {
  const id = randomUUID();
  const trialEndsAt = trialDays
    ? Date.now() + trialDays * 24 * 60 * 60 * 1000
    : null;

  const insertTenant = db.prepare(`
    INSERT INTO tenants (id, name, status, plan, trial_ends_at)
    VALUES (?, ?, 'trial', ?, ?)
  `);
  const insertSecrets = db.prepare(`
    INSERT INTO tenant_secrets
      (tenant_id, odata_url, username_enc, password_enc,
       docflow_url, docflow_user_enc, docflow_pass_enc)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    insertTenant.run(id, name, plan, trialEndsAt);
    insertSecrets.run(
      id,
      odataUrl,
      encrypt(username),
      encrypt(password),
      docflowUrl ?? null,
      docflowUser ? encrypt(docflowUser) : null,
      docflowPass ? encrypt(docflowPass) : null,
    );
  })();

  return { id };
}

/**
 * Get a tenant by ID. Returns null if not found.
 */
export function getTenantById(id) {
  return db.prepare("SELECT * FROM tenants WHERE id = ?").get(id) ?? null;
}

/**
 * Resolve the tenant for a Telegram user. Returns null if not linked.
 * @param {string|number} telegramId
 */
export function getTenantByTelegramId(telegramId) {
  const row = db.prepare(`
    SELECT t.* FROM tenants t
    JOIN users u ON u.tenant_id = t.id
    WHERE u.telegram_id = ?
  `).get(String(telegramId));
  return row ?? null;
}

/**
 * Return decrypted 1C credentials for a tenant.
 * @returns {{ odataUrl, username, password, docflowUrl?, docflowUser?, docflowPass? }}
 */
export function getSecrets(tenantId) {
  const row = db.prepare("SELECT * FROM tenant_secrets WHERE tenant_id = ?").get(tenantId);
  if (!row) throw new Error(`No secrets found for tenant ${tenantId}`);
  return {
    odataUrl:    row.odata_url,
    username:    decrypt(row.username_enc),
    password:    decrypt(row.password_enc),
    docflowUrl:  row.docflow_url ?? undefined,
    docflowUser: row.docflow_user_enc ? decrypt(row.docflow_user_enc) : undefined,
    docflowPass: row.docflow_pass_enc ? decrypt(row.docflow_pass_enc) : undefined,
  };
}

/**
 * Update a tenant's 1C credentials (re-encrypts and stores).
 */
export function updateSecrets(tenantId, { odataUrl, username, password,
    docflowUrl, docflowUser, docflowPass }) {
  db.prepare(`
    UPDATE tenant_secrets
    SET odata_url = ?, username_enc = ?, password_enc = ?,
        docflow_url = ?, docflow_user_enc = ?, docflow_pass_enc = ?
    WHERE tenant_id = ?
  `).run(
    odataUrl,
    encrypt(username),
    encrypt(password),
    docflowUrl ?? null,
    docflowUser ? encrypt(docflowUser) : null,
    docflowPass ? encrypt(docflowPass) : null,
    tenantId,
  );
}

/**
 * Set tenant status ('active','trial','suspended','cancelled').
 */
export function setTenantStatus(tenantId, status) {
  db.prepare("UPDATE tenants SET status = ? WHERE id = ?").run(status, tenantId);
}

/**
 * Returns true if the tenant has an active or unexpired trial subscription.
 */
export function isActive(tenant) {
  if (!tenant) return false;
  if (tenant.status === "active") return true;
  if (tenant.status === "trial") {
    if (!tenant.trial_ends_at) return true;          // no expiry set
    return Date.now() < tenant.trial_ends_at;
  }
  return false;
}

/**
 * List all tenants (for admin commands).
 */
export function listTenants() {
  return db.prepare("SELECT * FROM tenants ORDER BY created_at").all();
}

// ── Users ─────────────────────────────────────────────────────────────────────

/**
 * Link a Telegram user to a tenant.
 */
export function linkUser(telegramId, tenantId, role = "member") {
  db.prepare(`
    INSERT OR REPLACE INTO users (telegram_id, tenant_id, role)
    VALUES (?, ?, ?)
  `).run(String(telegramId), tenantId, role);
}

/**
 * Unlink a Telegram user from their tenant.
 */
export function unlinkUser(telegramId) {
  db.prepare("DELETE FROM users WHERE telegram_id = ?").run(String(telegramId));
}

// ── Durable conversation history ──────────────────────────────────────────────

const HISTORY_WINDOW = 40; // messages to load on cold start

/**
 * Append a message to the durable history.
 * @param {string} tenantId
 * @param {string|number} telegramId
 * @param {{ role, content, tool_calls?, tool_call_id? }} msg
 */
export function appendHistory(tenantId, telegramId, msg) {
  db.prepare(`
    INSERT INTO history (tenant_id, telegram_id, role, content, tool_calls, tool_call_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    tenantId,
    String(telegramId),
    msg.role,
    typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? ""),
    msg.tool_calls ? JSON.stringify(msg.tool_calls) : null,
    msg.tool_call_id ?? null,
  );
}

/**
 * Load the last HISTORY_WINDOW messages for a user (oldest-first, skipping system).
 */
export function loadHistory(tenantId, telegramId) {
  const rows = db.prepare(`
    SELECT role, content, tool_calls, tool_call_id FROM history
    WHERE tenant_id = ? AND telegram_id = ? AND role != 'system'
    ORDER BY ts DESC
    LIMIT ?
  `).all(tenantId, String(telegramId), HISTORY_WINDOW);

  return rows.reverse().map((r) => {
    const msg = { role: r.role, content: r.content };
    if (r.tool_calls)   msg.tool_calls   = JSON.parse(r.tool_calls);
    if (r.tool_call_id) msg.tool_call_id = r.tool_call_id;
    return msg;
  });
}

/**
 * Clear conversation history for a user.
 */
export function clearHistory(tenantId, telegramId) {
  db.prepare("DELETE FROM history WHERE tenant_id = ? AND telegram_id = ?")
    .run(tenantId, String(telegramId));
}

// ── Usage metering ─────────────────────────────────────────────────────────────

/**
 * Accumulate LLM token + tool-call usage for the current day.
 */
export function recordUsage(tenantId, { tokens = 0, toolCalls = 0 }) {
  const day = new Date().toISOString().slice(0, 10);
  db.prepare(`
    INSERT INTO usage (tenant_id, day, llm_tokens, tool_calls)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(tenant_id, day) DO UPDATE SET
      llm_tokens = llm_tokens + excluded.llm_tokens,
      tool_calls = tool_calls + excluded.tool_calls
  `).run(tenantId, day, tokens, toolCalls);
}

/**
 * Get usage summary for a tenant (last N days).
 */
export function getUsage(tenantId, days = 30) {
  return db.prepare(`
    SELECT day, llm_tokens, tool_calls FROM usage
    WHERE tenant_id = ? AND day >= date('now', ? || ' days')
    ORDER BY day DESC
  `).all(tenantId, String(-days));
}
