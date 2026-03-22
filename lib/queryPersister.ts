import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import { openDB } from "idb";

const DB_NAME = "VelarynQueryCache";
const STORE_NAME = "cache";
const CACHE_KEY = "react-query";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    },
  });
}

export function createIDBPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      const db = await getDb();
      await db.put(STORE_NAME, client, CACHE_KEY);
    },
    restoreClient: async () => {
      const db = await getDb();
      return (await db.get(STORE_NAME, CACHE_KEY)) as PersistedClient | undefined;
    },
    removeClient: async () => {
      const db = await getDb();
      await db.delete(STORE_NAME, CACHE_KEY);
    },
  };
}
