import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema";
import { desc, ilike } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { deleteProduct, toggleProduct } from "@/app/actions";
import SafeImage from "@/components/SafeImage";
import { naira, cn } from "@/lib/utils";
import { Pencil, Plus, Search, Star, Trash2, Eye, EyeOff } from "lucide-react";
import ConfirmButton from "@/components/admin/ConfirmButton";

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<{ q?: string; saved?: string }> }) {
  const { q, saved } = await searchParams;
  const rows = await db.query.products.findMany({
    where: q ? ilike(products.name, `%${q}%`) : undefined,
    orderBy: desc(products.createdAt),
    with: { category: true },
  });
  return (
    <>
      <PageHeader title="Products" desc={`${rows.length} products`}>
        <Link href="/products/new" className="btn-primary"><Plus className="h-4 w-4" /> Add product</Link>
      </PageHeader>
      {saved && <p className="mb-4 rounded-xl bg-brand-50 p-3 text-sm font-medium text-brand-800">Product saved successfully.</p>}
      <form className="relative mb-4 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input name="q" defaultValue={q} placeholder="Search products…" className="input !pl-10" />
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b bg-neutral-50/60 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Stock</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50/60">
                <td className="px-5 py-3">
                  <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                    <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-50"><SafeImage src={p.images[0] ?? ""} alt="" fill sizes="40px" className="object-cover" /></span>
                    <span className="font-medium hover:text-brand-700">{p.name}</span>
                  </Link>
                </td>
                <td className="px-5 py-3 text-neutral-600">{p.category?.name ?? "—"}</td>
                <td className="px-5 py-3 font-medium">{naira(p.price)}</td>
                <td className={cn("px-5 py-3 font-medium", p.stock === 0 ? "text-red-600" : p.stock < 5 ? "text-amber-600" : "")}>{p.stock}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <form action={toggleProduct}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="active" /><input type="hidden" name="value" value={String(p.active)} />
                      <button title={p.active ? "Visible — click to hide" : "Hidden — click to show"} className={cn("rounded-lg p-1.5", p.active ? "text-brand-600 hover:bg-brand-50" : "text-neutral-400 hover:bg-neutral-100")}>{p.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    </form>
                    <form action={toggleProduct}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="featured" /><input type="hidden" name="value" value={String(p.featured)} />
                      <button title={p.featured ? "Featured — click to unfeature" : "Click to feature"} className={cn("rounded-lg p-1.5", p.featured ? "text-amber-500 hover:bg-amber-50" : "text-neutral-300 hover:bg-neutral-100")}><Star className="h-4 w-4" fill={p.featured ? "currentColor" : "none"} /></button>
                    </form>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/products/${p.id}`} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-brand-700"><Pencil className="h-4 w-4" /></Link>
                    <form action={deleteProduct}><input type="hidden" name="id" value={p.id} />
                      <ConfirmButton message={`Delete “${p.name}”?`} className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-500">No products found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
