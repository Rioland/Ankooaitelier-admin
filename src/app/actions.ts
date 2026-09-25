"use server";
import { db } from "@/db";
import { admins, categories, heroSlides, messages, orders, products, settings, type StoreSettings } from "@/db/schema";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { slugify, splitList } from "@/lib/utils";
import { put } from "@vercel/blob";
import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type State = { ok?: boolean; error?: string } | null;

/* ---------- auth ---------- */
export async function login(_: State, fd: FormData): Promise<State> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  // Primary: DB-backed admin accounts (managed from the Admins page).
  const admin = await db.query.admins.findFirst({ where: eq(admins.email, email) });
  if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
    await createSession({ id: admin.id, email: admin.email, name: admin.name });
    redirect("/");
  }

  // Break-glass: the ADMIN_EMAIL / ADMIN_PASSWORD env account. On a successful
  // match it is upserted into the admins table so it shows up in the list and
  // can manage other admins — this bootstraps the very first account.
  const envEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const envPass = process.env.ADMIN_PASSWORD ?? "";
  if (envEmail && envPass && email === envEmail && !admin) {
    // ADMIN_PASSWORD may be plain text or a bcrypt hash ($2a$/$2b$…)
    const passOk = envPass.startsWith("$2") ? await bcrypt.compare(password, envPass) : password === envPass;
    if (passOk) {
      const passwordHash = envPass.startsWith("$2") ? envPass : await bcrypt.hash(envPass, 10);
      const [row] = await db
        .insert(admins)
        .values({ name: "Administrator", email: envEmail, passwordHash })
        .onConflictDoUpdate({ target: admins.email, set: { email: envEmail } })
        .returning();
      await createSession({ id: row.id, email: row.email, name: row.name });
      redirect("/");
    }
  }

  return { error: "Invalid email or password." };
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

/* ---------- admins ---------- */
export async function createAdmin(_: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!name || !email) return { error: "Name and email are required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(admins).values({ name, email, passwordHash });
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    return { error: msg.includes("unique") || msg.includes("duplicate") ? "An admin with this email already exists." : "Could not create admin." };
  }
  revalidatePath("/admins");
  return { ok: true };
}

export async function deleteAdmin(fd: FormData) {
  const session = await requireAdmin();
  const id = Number(fd.get("id"));
  if (!id || session.uid === id) return; // you can't remove your own access
  const [{ n }] = await db.select({ n: count() }).from(admins);
  if (n <= 1) return; // never remove the last admin
  await db.delete(admins).where(eq(admins.id, id));
  revalidatePath("/admins");
}

/* ---------- uploads ---------- */
export async function uploadImages(fd: FormData): Promise<{ urls: string[]; error?: string }> {
  await requireAdmin();
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) return { urls, error: "Only image files are allowed." };
    if (file.size > 6 * 1024 * 1024) return { urls, error: "Each image must be under 6MB." };
    const name = `products/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.name.split(".").pop()}`;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(name, file, { access: "public", addRandomSuffix: true });
      urls.push(blob.url);
    } else if (process.env.NODE_ENV !== "production") {
      // local dev fallback: write into /public/uploads
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const dir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(dir, { recursive: true });
      const fname = name.replace("products/", "");
      await fs.writeFile(path.join(dir, fname), Buffer.from(await file.arrayBuffer()));
      urls.push(`/uploads/${fname}`);
    } else {
      return { urls, error: "BLOB_READ_WRITE_TOKEN is missing. Create a Blob store in Vercel → Storage." };
    }
  }
  return { urls };
}

/* ---------- products ---------- */
function productFromForm(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const compare = Number(fd.get("compareAtPrice") || 0);
  const catId = Number(fd.get("categoryId") || 0);
  return {
    name,
    slug: slugify(String(fd.get("slug") || name)),
    description: String(fd.get("description") ?? ""),
    price: Number(fd.get("price") || 0),
    compareAtPrice: compare > 0 ? compare : null,
    categoryId: catId > 0 ? catId : null,
    gender: (String(fd.get("gender") || "unisex") as "men" | "women" | "unisex"),
    images: JSON.parse(String(fd.get("images") || "[]")) as string[],
    sizes: splitList(fd.get("sizes")),
    colors: splitList(fd.get("colors")),
    stock: Number(fd.get("stock") || 0),
    featured: fd.get("featured") === "on",
    isNew: fd.get("isNew") === "on",
    active: fd.get("active") === "on",
    updatedAt: new Date(),
  };
}

export async function saveProduct(_: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const id = Number(fd.get("id") || 0);
  const data = productFromForm(fd);
  if (!data.name || data.price <= 0) return { error: "Name and a price above 0 are required." };
  try {
    if (id) await db.update(products).set(data).where(eq(products.id, id));
    else await db.insert(products).values(data);
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    return { error: msg.includes("unique") || msg.includes("duplicate") ? "Another product already uses this slug." : "Could not save product." };
  }
  revalidatePath("/", "layout");
  redirect("/products?saved=1");
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
}

export async function toggleProduct(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const field = String(fd.get("field")) as "active" | "featured";
  const value = fd.get("value") === "true";
  await db.update(products).set({ [field]: !value }).where(eq(products.id, id));
  revalidatePath("/", "layout");
}

/* ---------- categories ---------- */
export async function saveCategory(_: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const id = Number(fd.get("id") || 0);
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };
  const data = {
    name,
    slug: slugify(String(fd.get("slug") || name)),
    description: String(fd.get("description") ?? ""),
    image: String(fd.get("image") ?? ""),
    sortOrder: Number(fd.get("sortOrder") || 0),
  };
  try {
    if (id) await db.update(categories).set(data).where(eq(categories.id, id));
    else await db.insert(categories).values(data);
  } catch {
    return { error: "A category with this slug already exists." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
}

/* ---------- orders ---------- */
export async function updateOrderStatus(fd: FormData) {
  await requireAdmin();
  const status = String(fd.get("status")) as typeof orders.$inferSelect.status;
  await db.update(orders).set({ status }).where(eq(orders.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
}

export async function deleteOrder(fd: FormData) {
  await requireAdmin();
  await db.delete(orders).where(eq(orders.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
  redirect("/orders");
}

/* ---------- hero slides ---------- */
export async function saveSlide(_: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const id = Number(fd.get("id") || 0);
  const data = {
    eyebrow: String(fd.get("eyebrow") ?? ""),
    title: String(fd.get("title") ?? "").trim(),
    subtitle: String(fd.get("subtitle") ?? ""),
    image: String(fd.get("image") ?? ""),
    ctaLabel: String(fd.get("ctaLabel") ?? "Shop now"),
    ctaHref: String(fd.get("ctaHref") ?? "/shop"),
    sortOrder: Number(fd.get("sortOrder") || 0),
    active: fd.get("active") === "on",
  };
  if (!data.title || !data.image) return { error: "Title and image are required." };
  if (id) await db.update(heroSlides).set(data).where(eq(heroSlides.id, id));
  else await db.insert(heroSlides).values(data);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteSlide(fd: FormData) {
  await requireAdmin();
  await db.delete(heroSlides).where(eq(heroSlides.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
}

/* ---------- messages ---------- */
export async function markMessageRead(fd: FormData) {
  await requireAdmin();
  await db.update(messages).set({ read: true }).where(eq(messages.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
}
export async function deleteMessage(fd: FormData) {
  await requireAdmin();
  await db.delete(messages).where(eq(messages.id, Number(fd.get("id"))));
  revalidatePath("/", "layout");
}

/* ---------- settings ---------- */
export async function saveSettings(_: State, fd: FormData): Promise<State> {
  await requireAdmin();
  const data = { ...DEFAULT_SETTINGS } as StoreSettings;
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof StoreSettings)[]) {
    const v = fd.get(key);
    if (v === null) continue;
    (data as Record<string, unknown>)[key] = typeof DEFAULT_SETTINGS[key] === "number" ? Number(v) || 0 : String(v);
  }
  data.whatsappNumber = data.whatsappNumber.replace(/\D/g, "");
  await db.insert(settings).values({ id: 1, data }).onConflictDoUpdate({ target: settings.id, set: { data, updatedAt: new Date() } });
  revalidatePath("/", "layout");
  return { ok: true };
}
