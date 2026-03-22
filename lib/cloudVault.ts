import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { appendForgeLogEntry } from "@/lib/forgeLog";

export type CloudVaultEnvelope = {
  cipherText: string;
  iv: string;
  salt: string;
  updatedAt: string;
  familyVaultId?: string | null;
};

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function deriveCloudKey(secret: string, saltSeed: string) {
  const salt = new TextEncoder().encode(saltSeed.slice(0, 64));
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
      iterations: 300_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptCloudVault(payload: unknown, secret: string, userSalt: string) {
  const key = await deriveCloudKey(secret, userSalt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(payload))
  );

  return {
    cipherText: toBase64(new Uint8Array(encrypted)),
    iv: toBase64(iv),
    salt: toBase64(new TextEncoder().encode(userSalt)),
    updatedAt: new Date().toISOString(),
  } satisfies CloudVaultEnvelope;
}

export async function decryptCloudVault<T>(envelope: CloudVaultEnvelope, secret: string, userSalt: string) {
  const key = await deriveCloudKey(secret, userSalt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(envelope.iv) },
    key,
    fromBase64(envelope.cipherText)
  );

  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

export async function syncEncryptedVault(payload: unknown, secret: string, familyVaultId?: string | null) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  let session = (await supabase.auth.getSession()).data.session;
  if (!session) {
    const authResponse = await supabase.auth.signInAnonymously();
    if (authResponse.error) {
      throw authResponse.error;
    }
    session = authResponse.data.session;
  }

  if (!session?.user?.id) {
    throw new Error("No Supabase user session available.");
  }

  const envelope = await encryptCloudVault(payload, secret, session.user.id);
  const { error } = await supabase.from("encrypted_vaults").upsert({
    owner_id: session.user.id,
    family_vault_id: familyVaultId ?? null,
    cipher_text: envelope.cipherText,
    iv: envelope.iv,
    salt: envelope.salt,
    updated_at: envelope.updatedAt,
  });

  if (error) {
    await appendForgeLogEntry({
      category: "cloud",
      level: "warning",
      message: `Encrypted sync failed: ${error.message}`,
    });
    throw error;
  }
}

export function subscribeToEncryptedVault(onRemoteChange: () => void) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const channel = supabase
    .channel("velaryn-encrypted-vault")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "encrypted_vaults" },
      () => onRemoteChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel).catch(() => undefined);
  };
}
