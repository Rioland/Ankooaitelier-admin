import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

function createDb() {
  if (!url) throw new Error("DATABASE_URL is not set. Connect Neon in your Vercel project or add it to .env");
  // Neon (production on Vercel) uses the HTTP driver; any other Postgres URL (e.g. local dev) uses node-postgres.
  if (url.includes("neon.tech") || process.env.USE_NEON_HTTP === "1") {
    return drizzleNeon(neon(url), { schema });
  }
  return drizzlePg(url, { schema }) as unknown as ReturnType<typeof drizzleNeon<typeof schema>>;
}

const g = globalThis as unknown as { __ankooDb?: ReturnType<typeof createDb> };
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_t, prop) {
    if (!g.__ankooDb) g.__ankooDb = createDb();
    return Reflect.get(g.__ankooDb, prop);
  },
});
export { schema };
