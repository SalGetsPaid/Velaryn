import fs from "fs";
import path from "path";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const dataDir = path.join(process.cwd(), "data");
const tokenPath = path.join(dataDir, "plaidTokens.json");

type EncryptedTokenEntry = {
  v: 2;
  iv: string;
  tag: string;
  cipherText: string;
};

function getVaultKey() {
  const seed = process.env.TOKEN_VAULT_KEY || process.env.AUDIT_SECRET || process.env.PLAID_SECRET || "velaryn-token-fallback";
  return createHash("sha256").update(seed).digest();
}

function encryptToken(token: string): EncryptedTokenEntry {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getVaultKey(), iv);
  const cipherText = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: 2,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    cipherText: cipherText.toString("hex"),
  };
}

function decryptToken(entry: EncryptedTokenEntry): string {
  const decipher = createDecipheriv("aes-256-gcm", getVaultKey(), Buffer.from(entry.iv, "hex"));
  decipher.setAuthTag(Buffer.from(entry.tag, "hex"));
  const value = Buffer.concat([
    decipher.update(Buffer.from(entry.cipherText, "hex")),
    decipher.final(),
  ]);
  return value.toString("utf8");
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(tokenPath)) {
    fs.writeFileSync(tokenPath, JSON.stringify({}), "utf8");
  }
}

export function getStoredTokens(): Record<string, string> {
  ensureDataDir();
  const raw = fs.readFileSync(tokenPath, "utf8");
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, string | EncryptedTokenEntry>;
    return Object.entries(parsed).reduce<Record<string, string>>((acc, [userId, value]) => {
      if (!value) return acc;
      if (typeof value === "string") {
        acc[userId] = value;
        return acc;
      }

      try {
        acc[userId] = decryptToken(value);
      } catch {
        // Drop unreadable entries instead of crashing token access paths.
      }

      return acc;
    }, {});
  } catch {
    return {};
  }
}

export function setStoredToken(userId: string, accessToken: string) {
  ensureDataDir();
  const raw = fs.readFileSync(tokenPath, "utf8");
  const parsed = raw ? (JSON.parse(raw) as Record<string, string | EncryptedTokenEntry>) : {};
  parsed[userId] = encryptToken(accessToken);
  fs.writeFileSync(tokenPath, JSON.stringify(parsed, null, 2), "utf8");
}

export function getStoredToken(userId: string): string | null {
  const tokens = getStoredTokens();
  return tokens[userId] || null;
}
