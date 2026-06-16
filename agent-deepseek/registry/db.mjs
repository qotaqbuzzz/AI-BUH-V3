/**
 * SQLite registry — tenants, secrets, users, durable conversation history, usage.
 *
 * Opens / creates the database at DB_PATH (env) or ./data/registry.db.
 * WAL mode is enabled for concurrent reads without blocking writes.
 *
 * IMPORTANT: this module is import-safe for the bot parent process only.
 * MCP child processes must NEVER have the DB path in their env.
 */
import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DB_PATH
  ?? resolve(__dirname, "../data/registry.db");

// Ensure directory exists
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

// WAL mode: concurrent readers without blocking writer
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS tenants (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'trial'
                  CHECK(status IN ('trial','active','suspended','cancelled')),
    plan          TEXT NOT NULL DEFAULT 'starter',
    trial_ends_at INTEGER,           -- unix epoch ms; NULL = no trial expiry
    created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS tenant_secrets (
    tenant_id       TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    odata_url       TEXT NOT NULL,   -- stored plain; credentials are encrypted separately
    username_enc    TEXT NOT NULL,   -- AES-256-GCM blob (crypto.mjs)
    password_enc    TEXT NOT NULL,
    docflow_url     TEXT,
    docflow_user_enc TEXT,
    docflow_pass_enc TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    telegram_id TEXT PRIMARY KEY,    -- string representation of the Telegram chat/user ID
    tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role        TEXT NOT NULL DEFAULT 'member'
                CHECK(role IN ('owner','member')),
    linked_at   INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tenant_id   TEXT NOT NULL,
    telegram_id TEXT NOT NULL,
    role        TEXT NOT NULL,       -- 'user' | 'assistant' | 'system' | 'tool'
    content     TEXT NOT NULL,
    tool_calls  TEXT,                -- JSON string for assistant tool_calls
    tool_call_id TEXT,               -- for 'tool' role
    ts          INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE INDEX IF NOT EXISTS idx_history_chat
    ON history(tenant_id, telegram_id, ts);

  CREATE TABLE IF NOT EXISTS usage (
    tenant_id   TEXT NOT NULL,
    day         TEXT NOT NULL,       -- ISO date, e.g. '2026-06-03'
    llm_tokens  INTEGER NOT NULL DEFAULT 0,
    tool_calls  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (tenant_id, day)
  );
`);

export default db;
