/**
 * TenantManager — process-per-tenant MCP client pool.
 *
 * Each active tenant gets one long-lived MCP child process holding only that
 * tenant's ONEC_* credentials (injected via allowlisted env). The pool is
 * lazily populated and evicted on idle or on child exit.
 *
 * Reliability features:
 *  - Spawn concurrency semaphore: max SPAWN_CONCURRENCY boots at a time (no spawn storm).
 *  - Per-tenant exponential backoff + quarantine: bad creds / unreachable 1C don't loop.
 *  - LRU cap: max MAX_WARM_TENANTS warm processes; evicts the stalest on overflow.
 *  - Idle eviction: processes idle > IDLE_TIMEOUT_MS are stopped.
 *  - onExit: child crash evicts the slot; next request triggers a fresh spawn w/ backoff.
 */
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { McpClient } from "./mcp-client.mjs";
import { getSecrets } from "./registry/tenants.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SERVER_DIR      = resolve(__dirname, process.env.MCP_SERVER_DIR ?? "../MCP 1C v1");
const MAX_WARM        = parseInt(process.env.MAX_WARM_TENANTS   ?? "15", 10);
const IDLE_TIMEOUT_MS = parseInt(process.env.IDLE_TIMEOUT_MIN   ?? "15", 10) * 60_000;
const SPAWN_CONC      = parseInt(process.env.SPAWN_CONCURRENCY  ?? "3",  10);
const MAX_FAILURES    = parseInt(process.env.SPAWN_MAX_FAILURES ?? "4",  10);
const BASE_BACKOFF_MS = 5_000;   // 5 s initial retry delay; doubles each failure

/** @type {Map<string, {client: McpClient, lastUsed: number}>} */
const pool = new Map();

/** Per-tenant spawn state for backoff + quarantine */
const spawnState = new Map(); // tenantId → { failures, nextRetryAt, quarantined }

/** Semaphore counter for concurrent spawns */
let spawnInFlight = 0;
const spawnQueue  = [];

function spawnSlotAcquire() {
  return new Promise((resolve) => {
    if (spawnInFlight < SPAWN_CONC) { spawnInFlight++; resolve(); return; }
    spawnQueue.push(resolve);
  });
}
function spawnSlotRelease() {
  if (spawnQueue.length > 0) {
    spawnQueue.shift()();          // pass token directly to the next waiter
  } else {
    spawnInFlight = Math.max(0, spawnInFlight - 1);
  }
}

function getSpawnState(tenantId) {
  if (!spawnState.has(tenantId)) {
    spawnState.set(tenantId, { failures: 0, nextRetryAt: 0, quarantined: false });
  }
  return spawnState.get(tenantId);
}

function onClientExit(tenantId) {
  pool.delete(tenantId);
  const st = getSpawnState(tenantId);
  st.failures++;
  if (st.failures >= MAX_FAILURES) {
    st.quarantined = true;
    process.stderr.write(
      `[TenantManager] Tenant ${tenantId} quarantined after ${st.failures} failures. ` +
      "Fix credentials and call tenantManager.clearQuarantine(tenantId) to re-enable.\n"
    );
  } else {
    const delay = BASE_BACKOFF_MS * Math.pow(2, st.failures - 1);
    st.nextRetryAt = Date.now() + delay;
    process.stderr.write(
      `[TenantManager] Tenant ${tenantId} will retry in ${Math.round(delay / 1000)}s ` +
      `(failure ${st.failures}/${MAX_FAILURES})\n`
    );
  }
}

/** Evict up to 1 oldest-used entry if pool is at capacity */
function evictIfNeeded() {
  if (pool.size < MAX_WARM) return;
  let oldest = null, oldestTime = Infinity;
  for (const [id, entry] of pool) {
    if (entry.lastUsed < oldestTime) { oldest = id; oldestTime = entry.lastUsed; }
  }
  if (oldest) {
    process.stderr.write(`[TenantManager] Evicting idle tenant ${oldest} (LRU cap)\n`);
    pool.get(oldest).client.stop();
    pool.delete(oldest);
  }
}

/**
 * Get (or lazily spawn) the MCP client for a tenant.
 * Throws if the tenant is quarantined or in backoff.
 * @param {string} tenantId
 * @returns {Promise<McpClient>}
 */
export async function getClient(tenantId) {
  // Return warm client immediately
  const existing = pool.get(tenantId);
  if (existing?.client?.isReady) {
    existing.lastUsed = Date.now();
    return existing.client;
  }

  // Check quarantine / backoff
  const st = getSpawnState(tenantId);
  if (st.quarantined) {
    throw new Error(
      "Your 1C connection has repeatedly failed to start. " +
      "Please contact support to re-configure your credentials."
    );
  }
  if (Date.now() < st.nextRetryAt) {
    const wait = Math.ceil((st.nextRetryAt - Date.now()) / 1000);
    throw new Error(`Reconnecting to your 1C server… please try again in ${wait}s.`);
  }

  // Acquire spawn slot (semaphore)
  await spawnSlotAcquire();
  // Double-check after acquiring (another fiber may have spawned it)
  const existing2 = pool.get(tenantId);
  if (existing2?.client?.isReady) {
    spawnSlotRelease();
    existing2.lastUsed = Date.now();
    return existing2.client;
  }

  try {
    // Load and decrypt tenant secrets from registry
    const secrets = getSecrets(tenantId);
    const tenantEnv = {
      ONEC_BASE_URL:  secrets.odataUrl,
      ONEC_USERNAME:  secrets.username,
      ONEC_PASSWORD:  secrets.password,
      ...(secrets.docflowUrl   ? { DOCFLOW_BASE_URL:  secrets.docflowUrl   } : {}),
      ...(secrets.docflowUser  ? { DOCFLOW_USERNAME:  secrets.docflowUser  } : {}),
      ...(secrets.docflowPass  ? { DOCFLOW_PASSWORD:  secrets.docflowPass  } : {}),
    };

    evictIfNeeded();

    const client = new McpClient(
      SERVER_DIR,
      tenantEnv,
      () => onClientExit(tenantId),
    );
    await client.start();

    // Success — reset failure counter
    st.failures    = 0;
    st.nextRetryAt = 0;

    pool.set(tenantId, { client, lastUsed: Date.now() });
    return client;
  } catch (err) {
    onClientExit(tenantId);
    throw err;
  } finally {
    spawnSlotRelease();
  }
}

/**
 * Clear quarantine state for a tenant (after credentials are updated).
 */
export function clearQuarantine(tenantId) {
  spawnState.delete(tenantId);
  process.stderr.write(`[TenantManager] Quarantine cleared for tenant ${tenantId}\n`);
}

/**
 * Stop the client for a specific tenant (e.g. after cred update).
 */
export function evictTenant(tenantId) {
  const entry = pool.get(tenantId);
  if (entry) { entry.client.stop(); pool.delete(tenantId); }
  spawnState.delete(tenantId);
}

/**
 * Gracefully stop all pooled clients (call on bot SIGTERM/SIGINT).
 */
export function stopAll() {
  for (const [id, entry] of pool) {
    process.stderr.write(`[TenantManager] Stopping tenant ${id}\n`);
    entry.client.stop();
  }
  pool.clear();
}

// ── Idle eviction timer ───────────────────────────────────────────────────────
setInterval(() => {
  const cutoff = Date.now() - IDLE_TIMEOUT_MS;
  for (const [id, entry] of pool) {
    if (entry.lastUsed < cutoff) {
      process.stderr.write(`[TenantManager] Idle-evicting tenant ${id}\n`);
      entry.client.stop();
      pool.delete(id);
    }
  }
}, 60_000).unref(); // .unref() so the timer doesn't prevent Node process exit
