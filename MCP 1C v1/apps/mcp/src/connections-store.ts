import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export interface ConnectionEntry {
  name:     string;
  baseUrl:  string;
  username: string;
  password: string;
  addedAt:  string; // ISO-8601
}

const DEFAULT_PATH = resolve(process.cwd(), "data", "connections.json");

function filePath(): string {
  return process.env.CONNECTIONS_FILE ?? DEFAULT_PATH;
}

function load(): ConnectionEntry[] {
  const p = filePath();
  if (!existsSync(p)) return [];
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as ConnectionEntry[];
  } catch {
    return [];
  }
}

function save(entries: ConnectionEntry[]): void {
  writeFileSync(filePath(), JSON.stringify(entries, null, 2), { encoding: "utf-8", mode: 0o600 });
}

export function getConnection(name: string): ConnectionEntry | undefined {
  return load().find(e => e.name.toLowerCase() === name.toLowerCase());
}

export function listConnections(): Omit<ConnectionEntry, "password">[] {
  return load().map(({ password: _p, ...rest }) => rest);
}

export function addConnection(entry: Omit<ConnectionEntry, "addedAt">): void {
  const entries = load().filter(e => e.name.toLowerCase() !== entry.name.toLowerCase());
  entries.push({ ...entry, addedAt: new Date().toISOString() });
  save(entries);
}

export function removeConnection(name: string): boolean {
  const before = load();
  const after  = before.filter(e => e.name.toLowerCase() !== name.toLowerCase());
  if (after.length === before.length) return false;
  save(after);
  return true;
}
