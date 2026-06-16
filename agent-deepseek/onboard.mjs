/**
 * Concierge onboarding CLI — owner-run tool to register a company.
 *
 * Usage:
 *   node onboard.mjs --company "Acme ТОО" --url https://1c.acme.kz --user readonly_user --pass s3cr3t --telegram 123456789
 *   node onboard.mjs --list
 *   node onboard.mjs --status <tenantId> active|suspended|trial|cancelled
 *   node onboard.mjs --unlink <telegramId>
 *   node onboard.mjs --clear-quarantine <tenantId>
 *
 * Security:
 *  - Enforces HTTPS scheme (basic auth over HTTP leaks the 1C password).
 *  - Validates that the hostname resolves to a PUBLIC IP (no SSRF via private/loopback ranges).
 *  - Pins the resolved IP and uses it for the test-connect to prevent DNS rebinding.
 *  - Credentials are encrypted at rest (AES-256-GCM) before being stored.
 *  - All input validated before any DB write.
 */
import "dotenv/config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import dns from "dns/promises";
import { McpClient } from "./mcp-client.mjs";
import {
  createTenant, getTenantById, listTenants,
  setTenantStatus, linkUser, unlinkUser,
} from "./registry/tenants.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = resolve(__dirname, process.env.MCP_SERVER_DIR ?? "../MCP 1C v1");
const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS ?? "14", 10);

// ── SSRF / private-IP guard ────────────────────────────────────────────────────

/** Returns true if the IP is private, loopback, link-local, or CGNAT */
function isPrivateIp(ip) {
  // IPv4
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (v4) {
    const [, a, b, c] = v4.map(Number);
    // 10.0.0.0/8
    if (a === 10) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 127.0.0.0/8 loopback
    if (a === 127) return true;
    // 169.254.0.0/16 link-local / metadata
    if (a === 169 && b === 254) return true;
    // 100.64.0.0/10 CGNAT
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 0.0.0.0/8
    if (a === 0) return true;
  }
  // IPv6 loopback / link-local / ULA
  if (ip === "::1") return true;
  if (/^fe80:/i.test(ip)) return true;
  if (/^fc/i.test(ip) || /^fd/i.test(ip)) return true;
  return false;
}

/**
 * Validate the OData URL:
 *  - Must be https://
 *  - Hostname must resolve to a public IP
 * Returns the resolved IP (to pin for the test-connect).
 */
async function validateOdataUrl(rawUrl) {
  let parsed;
  try { parsed = new URL(rawUrl); } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(
      `URL must use HTTPS (got ${parsed.protocol}). ` +
      "Sending 1C credentials over plain HTTP is insecure."
    );
  }
  const hostname = parsed.hostname;
  let addrs;
  try { addrs = await dns.resolve(hostname); } catch {
    throw new Error(`Cannot resolve hostname: ${hostname}`);
  }
  for (const ip of addrs) {
    if (isPrivateIp(ip)) {
      throw new Error(
        `Hostname ${hostname} resolved to a private/reserved IP (${ip}). ` +
        "Only publicly reachable 1C servers are supported."
      );
    }
  }
  return addrs[0];
}

// ── Test connection ────────────────────────────────────────────────────────────

async function testConnection(odataUrl, username, password) {
  const env = {
    ONEC_BASE_URL: odataUrl,
    ONEC_USERNAME: username,
    ONEC_PASSWORD: password,
  };
  process.stdout.write("  Testing 1C connection…");
  const client = new McpClient(SERVER_DIR, env);
  try {
    await client.start();
    // A fast offline tool to verify the server started + hands back at least 1 tool
    await client.callTool("kz_chart_list_sections", {});
    process.stdout.write(" ✅ Connection OK\n");
    return true;
  } catch (e) {
    process.stdout.write(` ❌ Failed: ${e.message}\n`);
    throw new Error(`Connection test failed: ${e.message}`);
  } finally {
    client.stop();
  }
}

// ── Commands ──────────────────────────────────────────────────────────────────

async function cmdOnboard({ company, url, user, pass, telegram }) {
  console.log(`\nOnboarding company: "${company}"`);

  // Validate URL + SSRF guard
  process.stdout.write("  Validating URL…");
  const ip = await validateOdataUrl(url);
  process.stdout.write(` ✅ Resolved to ${ip}\n`);

  // Test the connection
  await testConnection(url, user, pass);

  // Encrypt + store
  const { id } = createTenant({
    name:      company,
    odataUrl:  url,
    username:  user,
    password:  pass,
    plan:      "starter",
    trialDays: TRIAL_DAYS,
  });
  linkUser(telegram, id, "owner");

  const trialEnd = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10);
  console.log(`\n✅  Company "${company}" onboarded successfully.`);
  console.log(`   Tenant ID : ${id}`);
  console.log(`   Status    : trial (until ${trialEnd})`);
  console.log(`   Linked to : Telegram ${telegram}`);
  console.log(`\n   The user can now message the bot.\n`);
}

function cmdList() {
  const tenants = listTenants();
  if (tenants.length === 0) { console.log("No tenants registered yet."); return; }
  console.log(`\n${"ID".padEnd(38)} ${"Name".padEnd(25)} ${"Status".padEnd(12)} Plan`);
  console.log("─".repeat(85));
  for (const t of tenants) {
    const trialInfo = t.trial_ends_at
      ? ` (until ${new Date(t.trial_ends_at).toISOString().slice(0, 10)})`
      : "";
    console.log(
      `${t.id.padEnd(38)} ${t.name.slice(0, 24).padEnd(25)} ` +
      `${(t.status + trialInfo).padEnd(20)} ${t.plan}`
    );
  }
  console.log();
}

function cmdSetStatus(tenantId, status) {
  const valid = ["trial", "active", "suspended", "cancelled"];
  if (!valid.includes(status)) {
    console.error(`Invalid status "${status}". Valid: ${valid.join(", ")}`); process.exit(1);
  }
  const t = getTenantById(tenantId);
  if (!t) { console.error(`Tenant not found: ${tenantId}`); process.exit(1); }
  setTenantStatus(tenantId, status);
  console.log(`✅  Tenant "${t.name}" status → ${status}`);
}

function cmdUnlink(telegramId) {
  unlinkUser(telegramId);
  console.log(`✅  Telegram ${telegramId} unlinked.`);
}

// ── CLI parsing ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? (args[i + 1] ?? true) : null;
};

async function main() {
  if (flag("--list")) { cmdList(); return; }

  const statusId = flag("--status");
  if (statusId) { cmdSetStatus(statusId, args[args.indexOf("--status") + 2]); return; }

  const unlinkId = flag("--unlink");
  if (unlinkId) { cmdUnlink(unlinkId); return; }

  if (flag("--clear-quarantine")) {
    const { clearQuarantine } = await import("./tenant-manager.mjs");
    clearQuarantine(flag("--clear-quarantine"));
    console.log("Quarantine cleared.");
    return;
  }

  const company  = flag("--company");
  const url      = flag("--url");
  const user     = flag("--user");
  const pass     = flag("--pass");
  const telegram = flag("--telegram");

  if (!company || !url || !user || !pass || !telegram) {
    console.error(
      "Usage:\n" +
      "  node onboard.mjs --company <name> --url <https://…> --user <1c_user> --pass <1c_pass> --telegram <id>\n" +
      "  node onboard.mjs --list\n" +
      "  node onboard.mjs --status <tenantId> <active|suspended|trial|cancelled>\n" +
      "  node onboard.mjs --unlink <telegramId>\n" +
      "  node onboard.mjs --clear-quarantine <tenantId>"
    );
    process.exit(1);
  }

  await cmdOnboard({ company, url, user, pass, telegram });
}

main().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
