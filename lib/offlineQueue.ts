import { openDB } from "idb";
import type { ForgeEvent } from "@/app/ledger/types";

const DB_NAME = "VelarynOfflineQueue";
const STORE_NAME = "queue";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function enqueueForgeEvent(event: ForgeEvent) {
  const db = await getDb();
  await db.put(STORE_NAME, event);
}

export async function listQueuedForgeEvents() {
  const db = await getDb();
  return (await db.getAll(STORE_NAME)) as ForgeEvent[];
}

export async function removeQueuedForgeEvent(id: number) {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function countQueuedForgeEvents() {
  const db = await getDb();
  return db.count(STORE_NAME);
}
