"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { naira } from "@/lib/utils";

export default function SalesChart({ data }: { data: { label: string; value: number; orders: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="relative mt-6">
      <div className="flex h-48 items-end gap-1.5 sm:gap-2.5">
        {data.map((d, i) => (
          <div key={i} className="relative flex h-full flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            {hover === i && (
              <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow-lg">
                <p className="font-semibold">{naira(d.value)}</p>
                <p className="text-white/60">{d.orders} orders · {d.label}</p>
              </div>
            )}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
              transition={{ duration: 0.8, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full rounded-t-md ${hover === i ? "bg-brand-600" : d.value ? "bg-brand-400" : "bg-brand-100"}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-[10px] text-neutral-400 sm:gap-2.5">
        {data.map((d, i) => <span key={i} className="flex-1 text-center">{i % 2 === 0 ? d.label : ""}</span>)}
      </div>
    </div>
  );
}
