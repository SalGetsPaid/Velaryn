import { promises as fs } from "node:fs";
import path from "node:path";

export type DecreeState = "SYNCING" | "SETTLED" | "CANCELED";

export type DecreeRecord = {
  decreeId: string;
  principalId: string;
  actionId: string;
  amount: number;
  state: DecreeState;
  createdAt: string;
  updatedAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const decreePath = path.join(dataDir, "pending_decrees.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(decreePath);
  } catch {
    await fs.writeFile(decreePath, "{}", "utf8");
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(decreePath, "utf8");
  try {
    return JSON.parse(raw || "{}") as Record<string, DecreeRecord>;
  } catch {
    return {};
  }
}

async function writeStore(store: Record<string, DecreeRecord>) {
  await ensureStore();
  await fs.writeFile(decreePath, JSON.stringify(store, null, 2), "utf8");
}

export async function createPendingDecree(record: Omit<DecreeRecord, "createdAt" | "updatedAt" | "state">) {
  const store = await readStore();
  const now = new Date().toISOString();
  const next: DecreeRecord = {
    ...record,
    state: "SYNCING",
    createdAt: now,
    updatedAt: now,
  };
  store[record.decreeId] = next;
  await writeStore(store);
  return next;
}

export async function cancelDecree(decreeId: string) {
  const store = await readStore();
  const record = store[decreeId];
  if (!record) return null;
  if (record.state !== "SYNCING") return null;

  const next: DecreeRecord = {
    ...record,
    state: "CANCELED",
    updatedAt: new Date().toISOString(),
  };
  store[decreeId] = next;
  await writeStore(store);
  return next;
}

export async function settleDecree(decreeId: string) {
  const store = await readStore();
  const record = store[decreeId];
  if (!record) return null;
  if (record.state !== "SYNCING") return null;

  const next: DecreeRecord = {
    ...record,
    state: "SETTLED",
    updatedAt: new Date().toISOString(),
  };
  store[decreeId] = next;
  await writeStore(store);
  return next;
}

export async function getDecree(decreeId: string) {
  const store = await readStore();
  return store[decreeId] ?? null;
}