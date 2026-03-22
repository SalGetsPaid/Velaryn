import { openDB } from "idb";

export type ForgeLogLevel = "info" | "warning" | "error";

export type ForgeLogEntry = {
  id: string;
  timestamp: string;
  level: ForgeLogLevel;
  category: "sync" | "runtime" | "share" | "cloud";
  message: string;
};

const DB_NAME = "VelarynDiagnostics";
const STORE_NAME = "entries";
const RECORD_KEY = "forge-log";
const SALT_KEY = "velaryn_forge_log_salt";
const SECRET_KEY = "velaryn_vault_key_material";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    },
  });
}

function getSecret() {
  if (typeof window === "undefined") return "velaryn-log-secret";
  const existing = localStorage.getItem(SECRET_KEY);
  if (existing) return existing;

  const generated = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(SECRET_KEY, generated);
  return generated;
}

function getSalt() {
  if (typeof window === "undefined") {
    return new Uint8Array(16);
  }

  const existing = localStorage.getItem(SALT_KEY);
  if (existing) {
    return Uint8Array.from(atob(existing), (char) => char.charCodeAt(0));
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem(SALT_KEY, btoa(String.fromCharCode(...salt)));
  return salt;
}

async function deriveKey() {
  const secret = getSecret();
  const salt = getSalt();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt).buffer,
      iterations: 250_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function readStoredLog(): Promise<ForgeLogEntry[]> {
  if (typeof window === "undefined") return [];

  const db = await getDb();
  const record = (await db.get(STORE_NAME, RECORD_KEY)) as
    | { cipherText: string; iv: string }
    | undefined;

  if (!record) return [];

  const key = await deriveKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(record.iv) },
    key,
    fromBase64(record.cipherText)
  );

  return JSON.parse(new TextDecoder().decode(decrypted)) as ForgeLogEntry[];
}

async function writeStoredLog(entries: ForgeLogEntry[]) {
  if (typeof window === "undefined") return;

  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherText = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(entries.slice(0, 50)))
  );

  const db = await getDb();
  await db.put(
    STORE_NAME,
    {
      cipherText: toBase64(new Uint8Array(cipherText)),
      iv: toBase64(iv),
    },
    RECORD_KEY
  );
}

export async function appendForgeLogEntry(entry: Omit<ForgeLogEntry, "id" | "timestamp">) {
  try {
    const existing = await readStoredLog();
    const nextEntry: ForgeLogEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    await writeStoredLog([nextEntry, ...existing]);
  } catch (error) {
    console.error("Failed to write Forge Log", error);
  }
}

export async function readForgeLogEntries() {
  try {
    return await readStoredLog();
  } catch (error) {
    console.error("Failed to read Forge Log", error);
    return [];
  }
}
