import clsx, { type ClassValue } from "clsx";

export const cn = (...c: ClassValue[]) => clsx(c);

export const naira = (n: number) =>
  "₦" + Math.round(n).toLocaleString("en-NG");

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const discountPct = (price: number, compare?: number | null) =>
  compare && compare > price ? Math.round(((compare - price) / compare) * 100) : 0;

export const orderRef = () =>
  "ANK-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase();

export const splitList = (s: FormDataEntryValue | null) =>
  String(s ?? "").split(",").map((x) => x.trim()).filter(Boolean);
