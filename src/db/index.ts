import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "@/lib/env";
import * as schema from "./schema";

// WebSocket driver: supports interactive transactions (`db.transaction`), which stock and
// order writes need. Uses the runtime's global WebSocket (Node 22+). The pool connects lazily.
function createPool() {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  // Idle connections can be dropped by Neon; without a listener that error would crash the process.
  pool.on("error", (error: Error) => console.error("[db] idle connection error:", error));
  return pool;
}

// Reuse one pool across dev hot reloads instead of opening a new one per reload.
const globalForDb = globalThis as unknown as { atelierPool?: Pool };
export const pool = globalForDb.atelierPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.atelierPool = pool;

export const db = drizzle({ client: pool, schema });
