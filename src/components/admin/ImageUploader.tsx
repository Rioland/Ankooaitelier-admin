"use client";
import { useRef, useState } from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { uploadImages } from "@/app/actions";
import SafeImage from "../SafeImage";

export default function ImageUploader({ name, initial = [], multiple = true }: { name: string; initial?: string[]; multiple?: boolean }) {
  const [images, setImages] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError("");
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await uploadImages(fd);
    if (res.error) setError(res.error);
    setImages((prev) => (multiple ? [...prev, ...res.urls] : res.urls.slice(0, 1)));
    setBusy(false);
    if (input.current) input.current.value = "";
  };

  const addUrl = () => {
    if (!url.trim()) return;
    setImages((prev) => (multiple ? [...prev, url.trim()] : [url.trim()]));
    setUrl("");
  };

  return (
    <div>
      <input type="hidden" name={name} value={multiple ? JSON.stringify(images) : images[0] ?? ""} />
      <Reorder.Group axis="x" values={images} onReorder={setImages} className="flex flex-wrap gap-3">
        <AnimatePresence>
          {images.map((src, i) => (
            <Reorder.Item key={src} value={src} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="group relative h-28 w-24 cursor-grab overflow-hidden rounded-xl border bg-brand-50 active:cursor-grabbing">
              <SafeImage src={src} alt="" fill sizes="96px" className="pointer-events-none object-cover" />
              {i === 0 && multiple && <span className="absolute bottom-1 left-1 rounded bg-brand-600 px-1.5 text-[9px] font-bold text-white">MAIN</span>}
              <button type="button" onClick={() => setImages((p) => p.filter((x) => x !== src))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-red-600 opacity-0 shadow transition group-hover:opacity-100" aria-label="Remove image"><X className="h-3.5 w-3.5" /></button>
            </Reorder.Item>
          ))}
        </AnimatePresence>
        {(multiple || images.length === 0) && (
          <motion.button layout type="button" onClick={() => input.current?.click()} disabled={busy} className="grid h-28 w-24 place-items-center rounded-xl border-2 border-dashed border-brand-200 text-brand-600 transition hover:border-brand-500 hover:bg-brand-50">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <span className="flex flex-col items-center gap-1 text-[11px] font-semibold"><ImagePlus className="h-6 w-6" />Upload</span>}
          </motion.button>
        )}
      </Reorder.Group>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => onFiles(e.target.files)} />
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }} placeholder="…or paste an image URL" className="input !py-2 !pl-9" />
        </div>
        <button type="button" onClick={addUrl} className="btn-outline !px-4 !py-2">Add</button>
      </div>
      {multiple && images.length > 1 && <p className="mt-2 text-xs text-neutral-500">Drag to reorder — the first image is the main photo.</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
