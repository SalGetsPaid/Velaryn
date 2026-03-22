import { createHmac } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

function getAuditSecret() {
  return process.env.AUDIT_SECRET || process.env.PLAID_SECRET || "velaryn-audit-fallback";
}

export async function logSovereignAction(userId: string, actionId: string) {
  const timestamp = new Date().toISOString();
  const signature = createHmac("sha256", getAuditSecret())
    .update(`${userId}-${actionId}-${timestamp}`)
    .digest("hex");

  const record = { userId, actionId, timestamp, signature };
  const dataDir = path.join(process.cwd(), "data");
  const logPath = path.join(dataDir, "strike_audit_log.jsonl");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(logPath, `${JSON.stringify(record)}\n`, "utf8");

  return record;
}
