"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { saveProduct } from "@/app/actions";
import ImageUploader from "./ImageUploader";
import type { Category, Product } from "@/db/schema";

export default function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, action, pending] = useActionState(saveProduct, null);
  const p = product;
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="space-y-6">
        <section className="card space-y-4 p-6">
          <div><label className="label">Product name *</label><input name="name" defaultValue={p?.name} required className="input" /></div>
          <div><label className="label">URL slug</label><input name="slug" defaultValue={p?.slug} placeholder="auto-generated from name" className="input" /></div>
          <div><label className="label">Description</label><textarea name="description" defaultValue={p?.description} rows={7} className="input" /></div>
        </section>
        <section className="card p-6">
          <p className="label">Images</p>
          <ImageUploader name="images" initial={p?.images ?? []} />
        </section>
        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <div><label className="label">Price (₦) *</label><input name="price" type="number" min={0} defaultValue={p?.price} required className="input" /></div>
          <div><label className="label">Compare-at price (₦)</label><input name="compareAtPrice" type="number" min={0} defaultValue={p?.compareAtPrice ?? ""} placeholder="Original price, for sales" className="input" /></div>
          <div><label className="label">Sizes</label><input name="sizes" defaultValue={p?.sizes.join(", ")} placeholder="S, M, L, XL" className="input" /></div>
          <div><label className="label">Colours</label><input name="colors" defaultValue={p?.colors.join(", ")} placeholder="Black, White" className="input" /></div>
        </section>
      </div>
      <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <section className="card space-y-4 p-6">
          <div>
            <label className="label">Category</label>
            <select name="categoryId" defaultValue={p?.categoryId ?? ""} className="input">
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Shop for</label>
            <select name="gender" defaultValue={p?.gender ?? "unisex"} className="input">
              <option value="unisex">Everyone (unisex)</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
            </select>
          </div>
          <div><label className="label">Stock quantity</label><input name="stock" type="number" min={0} defaultValue={p?.stock ?? 10} className="input" /></div>
          <div className="space-y-3 pt-2">
            {[
              { n: "active", l: "Visible in store", d: p?.active ?? true },
              { n: "featured", l: "Featured on homepage", d: p?.featured ?? false },
              { n: "isNew", l: "Show in New Arrivals", d: p?.isNew ?? true },
            ].map((t) => (
              <label key={t.n} className="flex cursor-pointer items-center justify-between text-sm font-medium">
                {t.l}
                <input type="checkbox" name={t.n} defaultChecked={t.d} className="peer sr-only" />
                <span className="relative h-6 w-11 rounded-full bg-neutral-200 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-brand-600 peer-checked:after:translate-x-5" />
              </label>
            ))}
          </div>
        </section>
        {state?.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
        <div className="flex gap-3">
          <Link href="/products" className="btn-outline flex-1">Cancel</Link>
          <button disabled={pending} className="btn-primary flex-1">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</button>
        </div>
      </div>
    </form>
  );
}
