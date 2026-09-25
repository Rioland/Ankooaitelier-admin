import {
  pgTable, serial, text, integer, boolean, timestamp, jsonb, pgEnum, index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const genderEnum = pgEnum("gender", ["men", "women", "unisex"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").default(""),
  image: text("image").default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    price: integer("price").notNull(), // in Naira
    compareAtPrice: integer("compare_at_price"),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    gender: genderEnum("gender").notNull().default("unisex"),
    images: text("images").array().notNull().default([]),
    sizes: text("sizes").array().notNull().default([]),
    colors: text("colors").array().notNull().default([]),
    stock: integer("stock").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(true),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.categoryId)]
);

export type OrderItem = {
  productId: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
};

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").default(""),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  note: text("note").default(""),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  total: integer("total").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const heroSlides = pgTable("hero_slides", {
  id: serial("id").primaryKey(),
  eyebrow: text("eyebrow").default(""),
  title: text("title").notNull(),
  subtitle: text("subtitle").default(""),
  image: text("image").notNull(),
  ctaLabel: text("cta_label").default("Shop now"),
  ctaHref: text("cta_href").default("/shop"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export type StoreSettings = {
  storeName: string;
  tagline: string;
  whatsappNumber: string; // international format, digits only e.g. 2348012345678
  phone: string;
  email: string;
  address: string;
  hours: string;
  announcement: string;
  deliveryFee: number;
  freeShippingThreshold: number;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
};

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  data: jsonb("data").$type<StoreSettings>().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").default(""),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));
export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
}));

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Admin = typeof admins.$inferSelect;
