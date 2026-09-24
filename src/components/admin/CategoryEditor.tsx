"use client";
import { useActionState, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import { saveCategory } from "@/app/actions";
import ImageUploader from "./ImageUploader";
import type { Category } from "@/db/schema";

export default function CategoryEditor({ category }: { category?: Category }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveCategory, null);
  useEffect(() => { if (state?.ok) setOpen(false); }, [state]);
  return (
    <>
      {category ? (
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-brand-700" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add category</button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.form action={action} onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-lg space-y-4 rounded-3xl bg-white p-6 text-left sm:p-8">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl font-semibold">{category ? "Edit category" : "New category"}</p>
                <button type="button" onClick={() => setOpen(false)}><X /></button>
              </div>
              {category && <input type="hidden" name="id" value={category.id} />}
              <div><label className="label">Name *</label><input name="name" required defaultValue={category?.name} className="input" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Slug</label><input name="slug" defaultValue={category?.slug} placeholder="auto" className="input" /></div>
                <div><label className="label">Sort order</label><input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className="input" /></div>
              </div>
              <div><label className="label">Description</label><textarea name="description" rows={2} defaultValue={category?.description ?? ""} className="input" /></div>
              <div><label className="label">Cover image</label><ImageUploader name="image" multiple={false} initial={category?.image ? [category.image] : []} /></div>
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Save category</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
