"use client";
import { useActionState, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import { saveSlide } from "@/app/actions";
import ImageUploader from "./ImageUploader";
import type { HeroSlide } from "@/db/schema";

export default function SlideEditor({ slide }: { slide?: HeroSlide }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveSlide, null);
  useEffect(() => { if (state?.ok) setOpen(false); }, [state]);
  return (
    <>
      {slide ? (
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-brand-700" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add slide</button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.form action={action} onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-lg space-y-4 rounded-3xl bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl font-semibold">{slide ? "Edit slide" : "New slide"}</p>
                <button type="button" onClick={() => setOpen(false)}><X /></button>
              </div>
              {slide && <input type="hidden" name="id" value={slide.id} />}
              <div><label className="label">Small label</label><input name="eyebrow" defaultValue={slide?.eyebrow ?? ""} placeholder="New Season" className="input" /></div>
              <div><label className="label">Headline *</label><input name="title" required defaultValue={slide?.title} className="input" /></div>
              <div><label className="label">Sub-text</label><textarea name="subtitle" rows={2} defaultValue={slide?.subtitle ?? ""} className="input" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Button text</label><input name="ctaLabel" defaultValue={slide?.ctaLabel ?? "Shop now"} className="input" /></div>
                <div><label className="label">Button link</label><input name="ctaHref" defaultValue={slide?.ctaHref ?? "/shop"} className="input" /></div>
              </div>
              <div className="grid grid-cols-2 items-end gap-4">
                <div><label className="label">Order</label><input name="sortOrder" type="number" defaultValue={slide?.sortOrder ?? 0} className="input" /></div>
                <label className="flex items-center gap-2 pb-3 text-sm font-medium"><input type="checkbox" name="active" defaultChecked={slide?.active ?? true} className="h-4 w-4 accent-brand-600" /> Active</label>
              </div>
              <div><label className="label">Background image * (wide, 1920px+)</label><ImageUploader name="image" multiple={false} initial={slide?.image ? [slide.image] : []} /></div>
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Save slide</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
