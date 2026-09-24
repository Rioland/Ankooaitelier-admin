"use client";
import { useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { saveSettings } from "@/app/actions";
import type { StoreSettings } from "@/db/schema";

const GROUPS: { title: string; fields: { k: keyof StoreSettings; l: string; hint?: string; type?: string; wide?: boolean }[] }[] = [
  { title: "Store", fields: [
    { k: "storeName", l: "Store name" },
    { k: "tagline", l: "Tagline" },
    { k: "announcement", l: "Announcement bar", hint: "Scrolling text at the very top. Leave empty to hide.", wide: true },
  ] },
  { title: "WhatsApp & contact", fields: [
    { k: "whatsappNumber", l: "WhatsApp number", hint: "International format, digits only — e.g. 2348012345678. Orders are sent here." },
    { k: "phone", l: "Phone" },
    { k: "email", l: "Email" },
    { k: "hours", l: "Opening hours" },
    { k: "address", l: "Address", wide: true },
  ] },
  { title: "Delivery", fields: [
    { k: "deliveryFee", l: "Delivery fee (₦)", type: "number" },
    { k: "freeShippingThreshold", l: "Free delivery above (₦)", type: "number", hint: "Set 0 to disable free delivery." },
  ] },
  { title: "Social links", fields: [
    { k: "instagram", l: "Instagram URL" },
    { k: "facebook", l: "Facebook URL" },
    { k: "twitter", l: "X / Twitter URL" },
    { k: "tiktok", l: "TikTok URL" },
  ] },
];

export default function SettingsForm({ s }: { s: StoreSettings }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  return (
    <form action={action} className="space-y-6">
      {GROUPS.map((g) => (
        <section key={g.title} className="card p-6">
          <p className="mb-5 font-semibold">{g.title}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => (
              <div key={f.k} className={f.wide ? "sm:col-span-2" : ""}>
                <label className="label">{f.l}</label>
                <input name={f.k} type={f.type ?? "text"} defaultValue={String(s[f.k] ?? "")} className="input" />
                {f.hint && <p className="mt-1 text-xs text-neutral-500">{f.hint}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="sticky bottom-4 flex items-center justify-end gap-4">
        <AnimatePresence>{state?.ok && !pending && <motion.p initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-sm font-medium text-brand-700"><CheckCircle2 className="h-4 w-4" /> Saved</motion.p>}</AnimatePresence>
        <button disabled={pending} className="btn-primary shadow-xl">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings</button>
      </div>
    </form>
  );
}
