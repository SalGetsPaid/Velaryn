import { openDB } from "idb";
import { useCallback } from "react";

const DB_NAME = "VelarynVault";
const STORE = "ledger";
const APP_STATE_STORAGE_KEY = "velaryn_app_state_vault";

function toBase64(bytes: Uint8Array) {
  if (typeof window === "undefined") return "";
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string) {
  if (typeof window === "undefined") return new Uint8Array();
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesKey(userPinOrBiometricKey: string, salt: Uint8Array, usage: KeyUsage[]) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(userPinOrBiometricKey),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const normalizedSalt = new Uint8Array(salt);

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: normalizedSalt.buffer, iterations: 1_000_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    usage
  );
}

export async function encryptAndStoreLedger(data: unknown, userPinOrBiometricKey: string, storageKey: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await deriveAesKey(userPinOrBiometricKey, salt, ["encrypt"]);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    new TextEncoder().encode(JSON.stringify(data))
  );

  const encrypted = new Uint8Array(encryptedBuffer);

  const db = await openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE);
      }
    },
  });

  await db.put(
    STORE,
    {
      encrypted: toBase64(encrypted),
      iv: toBase64(iv),
      salt: toBase64(salt),
      updatedAt: new Date().toISOString(),
    },
    storageKey
  );
}

export async function decryptLedger<T = unknown>(userPinOrBiometricKey: string, storageKey: string): Promise<T> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE);
      }
    },
  });

  const record = (await db.get(STORE, storageKey)) as
    | { encrypted: string; iv: string; salt: string }
    | undefined;

  if (!record) {
    throw new Error("Vault locked");
  }

  const iv = fromBase64(record.iv);
  const salt = fromBase64(record.salt);
  const encrypted = fromBase64(record.encrypted);

  const cryptoKey = await deriveAesKey(userPinOrBiometricKey, salt, ["decrypt"]);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encrypted
  );

  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

function getVaultKeyMaterial() {
  if (typeof window === "undefined") return "velaryn-vault-bootstrap";

  const existing = localStorage.getItem("velaryn_vault_key_material");
  if (existing) return existing;

  const generated = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem("velaryn_vault_key_material", generated);
  return generated;
}

export function useVault() {
  const getVaultData = useCallback(async <T = unknown>(key: string) => {
    try {
      const keyMaterial = getVaultKeyMaterial();
      const snapshot = await decryptLedger<Record<string, unknown>>(keyMaterial, APP_STATE_STORAGE_KEY);
      return (snapshot[key] as T | undefined) ?? null;
    } catch {
      return null;
    }
  }, []);

  const setVaultData = useCallback(async (key: string, value: unknown) => {
    const keyMaterial = getVaultKeyMaterial();
    let snapshot: Record<string, unknown> = {};

    try {
      snapshot = await decryptLedger<Record<string, unknown>>(keyMaterial, APP_STATE_STORAGE_KEY);
    } catch {
      snapshot = {};
    }

    const next = {
      ...snapshot,
      [key]: value,
    };

    await encryptAndStoreLedger(next, keyMaterial, APP_STATE_STORAGE_KEY);
  }, []);

  return {
    getVaultData,
    setVaultData,
  };
}
