"use client";
import { useActionState, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import { createAdmin } from "@/app/actions";

export default function AdminEditor() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createAdmin, null);
  useEffect(() => { if (state?.ok) setOpen(false); }, [state]);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add admin</button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.form action={action} onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 text-left sm:p-8">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl font-semibold">New admin</p>
                <button type="button" onClick={() => setOpen(false)}><X /></button>
              </div>
              <div><label className="label">Name *</label><input name="name" required autoComplete="off" className="input" /></div>
              <div><label className="label">Email *</label><input name="email" type="email" required autoComplete="off" className="input" /></div>
              <div>
                <label className="label">Password *</label>
                <input name="password" type="password" required minLength={6} autoComplete="new-password" className="input" />
                <p className="mt-1 text-xs text-neutral-500">At least 6 characters. They can sign in with this straight away.</p>
              </div>
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <button disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Create admin</button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
