import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { asc, count, eq } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import CategoryEditor from "@/components/admin/CategoryEditor";
import ConfirmButton from "@/components/admin/ConfirmButton";
import SafeImage from "@/components/SafeImage";
import { deleteCategory } from "@/app/actions";
import { Trash2 } from "lucide-react";

export default async function CategoriesAdmin() {
  const rows = await db
    .select({ c: categories, n: count(products.id) })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder));
  return (
    <>
      <PageHeader title="Categories" desc="Organise products into collections shown across the store."><CategoryEditor /></PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ c, n }) => (
          <div key={c.id} className="card overflow-hidden">
            <div className="relative h-36 bg-brand-50"><SafeImage src={c.image ?? ""} alt={c.name} fill sizes="400px" className="object-cover" /></div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-neutral-500">/{c.slug} · {n} products</p>
              </div>
              <div className="flex">
                <CategoryEditor category={c} />
                <form action={deleteCategory}><input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message={`Delete “${c.name}”? Products will be kept but uncategorised.`} className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></ConfirmButton>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && <p className="card p-10 text-center text-neutral-500">No categories yet.</p>}
    </>
  );
}
