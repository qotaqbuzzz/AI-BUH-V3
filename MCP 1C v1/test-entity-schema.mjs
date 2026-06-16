/**
 * MCP stdio test client — exercises the four entity schema tools.
 * Run: node test-entity-schema.mjs
 */

import { spawn }  from "child_process";
import { createInterface } from "readline";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

// ── Paths ──────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ── Load env vars (only those not already in the environment) ──────────────
const dotenvPath = join(__dirname, ".env");
try {
  for (const line of readFileSync(dotenvPath, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* .env optional */ }

// ── Spawn the MCP server ───────────────────────────────────────────────────
const mcpDir = join(__dirname, "apps", "mcp");
// tsx lives in root node_modules (hoisted in this monorepo)
const tsxBin = join(__dirname, "node_modules", ".bin", "tsx");

const server = spawn(tsxBin, ["src/index.ts"], {
  cwd:   mcpDir,
  env:   process.env,
  stdio: ["pipe", "pipe", "pipe"],
  shell: true,   // needed on Windows to resolve bin scripts
});

server.stderr.on("data", d => process.stderr.write(`[server] ${d}`));
server.on("error", e => { console.error("spawn error:", e); process.exit(1); });

let msgId = 1;
const pending = new Map();

// Write one JSON-RPC line to the server's stdin
function send(msg) {
  const json = JSON.stringify(msg);
  server.stdin.write(json + "\n");
}

// Promise-based call
function call(method, params) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, { resolve, reject });
    send({ jsonrpc: "2.0", id, method, params });
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`Timeout on ${method}`));
      }
    }, 15_000);
  });
}

// Parse server stdout line by line
const rl = createInterface({ input: server.stdout });
rl.on("line", line => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (msg.id != null && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else           resolve(msg.result);
  }
});

// ── Test runner ────────────────────────────────────────────────────────────
function ok(label)   { console.log(`  ✅ ${label}`); }
function fail(label) { console.log(`  ❌ ${label}`); }
function probe(label){ console.log(`  🔍 ${label}`); }
function section(h)  { console.log(`\n── ${h} ──`); }

async function run() {
  console.log("Starting MCP entity schema verification…\n");

  // ── 1. MCP handshake ──────────────────────────────────────────────────────
  section("MCP handshake");
  const initResult = await call("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0" },
  });
  send({ jsonrpc: "2.0", method: "notifications/initialized" });
  ok(`Server identified as: ${initResult.serverInfo?.name} v${initResult.serverInfo?.version}`);

  // ── 2. Confirm new tools are listed ──────────────────────────────────────
  section("tools/list — entity schema tools present");
  const { tools } = await call("tools/list", {});
  const toolNames = tools.map(t => t.name);
  const expected  = ["onec_get_entity_schema","onec_search_entities","onec_find_field","onec_get_entity_relations"];
  for (const name of expected) {
    toolNames.includes(name) ? ok(name) : fail(`MISSING: ${name}`);
  }
  console.log(`  (${toolNames.length} tools total)`);

  // ── 3. onec_get_entity_schema — known entity ──────────────────────────────
  section("onec_get_entity_schema — Catalog_Банки");
  const r1 = await call("tools/call", { name: "onec_get_entity_schema", arguments: { entityName: "Catalog_Банки" } });
  const s1  = JSON.parse(r1.content[0].text);
  s1.found                ? ok(`found=true, category=${s1.category}`) : fail("entity not found");
  s1.propertyCount === 21 ? ok(`propertyCount=21 (correct)`)         : fail(`propertyCount=${s1.propertyCount} (expected 21)`);
  s1.relationCount === 1  ? ok(`relationCount=1 (correct)`)          : fail(`relationCount=${s1.relationCount} (expected 1)`);
  const relOk = s1.relations?.[0]?.targetEntity === "Catalog_Контрагенты";
  relOk ? ok(`relation→Catalog_Контрагенты (correct)`) : fail(`relation wrong: ${JSON.stringify(s1.relations?.[0])}`);

  // ── 4. onec_get_entity_schema — Document with many fields ─────────────────
  section("onec_get_entity_schema — Document_АвансовыйОтчет");
  const r2 = await call("tools/call", { name: "onec_get_entity_schema", arguments: { entityName: "Document_АвансовыйОтчет" } });
  const s2  = JSON.parse(r2.content[0].text);
  s2.found                ? ok(`found=true`)                         : fail("entity not found");
  s2.propertyCount === 42 ? ok(`propertyCount=42 (correct)`)        : fail(`propertyCount=${s2.propertyCount} (expected 42)`);
  s2.relationCount === 11 ? ok(`relationCount=11 (correct)`)        : fail(`relationCount=${s2.relationCount} (expected 11)`);

  // ── 5. onec_get_entity_schema — not found ────────────────────────────────
  section("onec_get_entity_schema — unknown entity (edge case)");
  probe("entityName='Catalog_НесуществующийОбъект'");
  const r3 = await call("tools/call", { name: "onec_get_entity_schema", arguments: { entityName: "Catalog_НесуществующийОбъект" } });
  const s3  = JSON.parse(r3.content[0].text);
  !s3.found && s3.suggestion ? ok(`graceful not-found with suggestion: "${s3.suggestion.slice(0,60)}…"`) : fail(`unexpected response: ${JSON.stringify(s3)}`);

  // ── 6. onec_search_entities ───────────────────────────────────────────────
  section("onec_search_entities — 'Поступление' in Document");
  const r4 = await call("tools/call", { name: "onec_search_entities", arguments: { query: "Поступление", category: "Document" } });
  const s4  = JSON.parse(r4.content[0].text);
  const names4 = s4.results.map(x => x.name);
  names4.includes("Document_ПоступлениеТоваровУслуг")
    ? ok(`found Document_ПоступлениеТоваровУслуг (${s4.found} total matches)`)
    : fail(`Document_ПоступлениеТоваровУслуг not in results: ${names4.join(", ")}`);

  section("onec_search_entities — 'Платёж' no category filter");
  probe("searching cross-category for 'Платёж'");
  const r4b = await call("tools/call", { name: "onec_search_entities", arguments: { query: "Платёж", limit: 10 } });
  const s4b  = JSON.parse(r4b.content[0].text);
  s4b.found > 0
    ? ok(`${s4b.found} results: ${s4b.results.map(x=>x.name).join(", ")}`)
    : probe("no results for Платёж — may be spelled differently in 1C");

  // ── 7. onec_find_field ────────────────────────────────────────────────────
  section("onec_find_field — 'НазначениеПлатежа'");
  const r5  = await call("tools/call", { name: "onec_find_field", arguments: { fieldName: "НазначениеПлатежа" } });
  const s5   = JSON.parse(r5.content[0].text);
  const ents5 = s5.results.map(x => x.entityName);
  ents5.includes("Document_ПлатежноеПоручениеИсходящее")
    ? ok(`found in Document_ПлатежноеПоручениеИсходящее`)
    : fail(`not found in outgoing payment: ${ents5.slice(0,5)}`);
  ents5.includes("Document_ПлатежноеПоручениеВходящее")
    ? ok(`found in Document_ПлатежноеПоручениеВходящее`)
    : fail(`not found in incoming payment`);
  ok(`total ${s5.found} entities contain НазначениеПлатежа`);

  section("onec_find_field — 'СуммаДокумента'");
  probe("searching for common field across many document types");
  const r5b  = await call("tools/call", { name: "onec_find_field", arguments: { fieldName: "СуммаДокумента", limit: 30 } });
  const s5b   = JSON.parse(r5b.content[0].text);
  s5b.found >= 5 ? ok(`${s5b.found} entities — widely shared (limit 30)`) : fail(`only ${s5b.found} entities`);

  section("onec_find_field — partial match 'Назначение'");
  probe("substring search for field fragments");
  const r5c  = await call("tools/call", { name: "onec_find_field", arguments: { fieldName: "Назначение", limit: 10 } });
  const s5c   = JSON.parse(r5c.content[0].text);
  s5c.found > 0
    ? ok(`${s5c.found} entities match 'Назначение' substring`)
    : fail("no substring matches");

  // ── 8. onec_get_entity_relations ──────────────────────────────────────────
  section("onec_get_entity_relations — Catalog_Контрагенты");
  const r6  = await call("tools/call", { name: "onec_get_entity_relations", arguments: { entityName: "Catalog_Контрагенты" } });
  const s6   = JSON.parse(r6.content[0].text);
  s6.found                    ? ok(`found=true`)                              : fail("entity not found");
  s6.outboundCount > 0        ? ok(`outbound=${s6.outboundCount} relations`)  : fail("no outbound relations");
  s6.inboundCount > 10        ? ok(`inbound=${s6.inboundCount} refs (many entities reference Контрагенты)`) : probe(`inbound=${s6.inboundCount}`);
  console.log(`  sample inbound: ${s6.inbound.slice(0,3).map(x=>`${x.from}→${x.field}`).join(", ")}`);

  section("onec_get_entity_relations — unknown entity");
  probe("entityName='Document_Фантом'");
  const r6b  = await call("tools/call", { name: "onec_get_entity_relations", arguments: { entityName: "Document_Фантом" } });
  const s6b   = JSON.parse(r6b.content[0].text);
  !s6b.found ? ok("graceful not-found") : fail("should have returned found=false");

  // ── 9. MCP resource: onec://entities ─────────────────────────────────────
  section("resources/read — onec://entities index");
  const { resources } = await call("resources/list", {});
  const entRes = resources.find(r => r.uri === "onec://entities");
  entRes ? ok(`resource onec://entities registered: "${entRes.description?.slice(0,60)}…"`) : fail("onec://entities resource NOT listed");

  if (entRes) {
    const rr = await call("resources/read", { uri: "onec://entities" });
    const data = JSON.parse(rr.contents[0].text);
    data.total === 889 ? ok(`total=889 entities`) : fail(`total=${data.total} (expected 889)`);
    const cats = Object.keys(data.byCategory);
    cats.includes("Document") && cats.includes("Catalog")
      ? ok(`byCategory has ${cats.length} categories: ${cats.join(", ")}`)
      : fail(`missing categories: ${cats}`);
    const docCount = data.byCategory.Document?.length;
    docCount === 423 ? ok(`Document category: 423 entries`) : fail(`Document count=${docCount} (expected 423)`);
  }

  console.log("\n─────────────────────────────────────");
  console.log("Verification complete.");
  server.kill();
  process.exit(0);
}

run().catch(e => {
  console.error("\nFATAL:", e.message);
  server.kill();
  process.exit(1);
});
