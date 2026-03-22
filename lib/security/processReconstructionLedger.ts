import { createHmac, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type ProcessReconstructionEntry = {
  id: string;
  route: string;
  principalId: string;
  objective: string;
  inputs: Record<string, unknown>;
  reasoningPath: string[];
  outcome: Record<string, unknown>;
  complianceBasis: string[];
  timestamp: string;
  signature: string;
};

function getLedgerSecret() {
  return process.env.AUDIT_SECRET || process.env.PLAID_SECRET || "velaryn-process-ledger-fallback";
}

function buildSignature(payload: Omit<ProcessReconstructionEntry, "signature">) {
  return createHmac("sha256", getLedgerSecret())
    .update(JSON.stringify(payload))
    .digest("hex");
}

export async function logProcessReconstruction(
  input: Omit<ProcessReconstructionEntry, "id" | "timestamp" | "signature">
) {
  const payload = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...input,
  };

  const signed: ProcessReconstructionEntry = {
    ...payload,
    signature: buildSignature(payload),
  };

  const dataDir = path.join(process.cwd(), "data");
  const logPath = path.join(dataDir, "process_reconstruction_ledger.jsonl");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(logPath, `${JSON.stringify(signed)}\n`, "utf8");

  return signed;
}

export async function readProcessReconstruction(limit = 25) {
  const dataDir = path.join(process.cwd(), "data");
  const logPath = path.join(dataDir, "process_reconstruction_ledger.jsonl");

  try {
    const raw = await fs.readFile(logPath, "utf8");
    const entries = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ProcessReconstructionEntry)
      .reverse();

    return entries.slice(0, Math.max(1, Math.min(limit, 100)));
  } catch {
    return [];
  }
}
