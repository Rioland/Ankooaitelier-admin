import ProductForm from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export default async function NewProduct() {
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  return (<><PageHeader title="Add product" /><ProductForm categories={cats} /></>);
}
