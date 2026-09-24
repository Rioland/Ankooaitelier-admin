import "server-only";
import { db } from "@/db";
import { settings, type StoreSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_SETTINGS } from "./defaults";
import { cache } from "react";

export const getSettings = cache(async (): Promise<StoreSettings> => {
  try {
    const row = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
    return { ...DEFAULT_SETTINGS, ...(row?.data ?? {}) };
  } catch (e) {
    console.error("getSettings failed", e);
    return DEFAULT_SETTINGS;
  }
});
