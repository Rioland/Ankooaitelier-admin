"use client";
import Link from "next/link";
import { storeUrl } from "@/lib/store";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Package, Tags, ShoppingCart, Images, Mail, Settings, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/slides", label: "Hero slides", icon: Images },
  { href: "/messages", label: "Messages", icon: Mail },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ pendingOrders, unread }: { pendingOrders: number; unread: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const badge = (href: string) => (href === "/orders" ? pendingOrders : href === "/messages" ? unread : 0);

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-3 px-6 py-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 font-display text-lg font-bold text-white">A</span>
        <span className="font-display text-xl font-semibold text-white">Ankooaitelier <span className="text-brand-300">Admin</span></span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition", active ? "text-white" : "text-brand-100/70 hover:bg-white/5 hover:text-white")}>
              {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-brand-600" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <Icon className="relative h-4 w-4" />
              <span className="relative flex-1">{label}</span>
              {badge(href) > 0 && <span className="relative rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-brand-800">{badge(href)}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href={storeUrl()} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-brand-100/70 hover:bg-white/5 hover:text-white"><ExternalLink className="h-4 w-4" /> View store</a>
        <form action={logout}><button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-brand-100/70 hover:bg-white/5 hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button></form>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between bg-brand-950 px-4 py-3 lg:hidden">
        <span className="font-display text-lg font-semibold text-white">Ankooaitelier Admin</span>
        <button onClick={() => setOpen(true)} className="text-white" aria-label="Menu"><Menu /></button>
      </div>
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-brand-950 lg:block">{content}</aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-64 bg-brand-950 lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-6 text-white" aria-label="Close"><X /></button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
