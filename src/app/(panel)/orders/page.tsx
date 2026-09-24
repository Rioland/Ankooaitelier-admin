import Link from "next/link";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { ORDER_STATUSES, PageHeader, StatusBadge } from "@/components/admin/ui";
import { cn, naira } from "@/lib/utils";
import { Search } from "lucide-react";

export default async function OrdersAdmin({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const rows = await db.select().from(orders).where(
    and(
      status && (ORDER_STATUSES as readonly string[]).includes(status) ? eq(orders.status, status as (typeof ORDER_STATUSES)[number]) : undefined,
      q ? or(ilike(orders.reference, `%${q}%`), ilike(orders.customerName, `%${q}%`), ilike(orders.phone, `%${q}%`)) : undefined
    )
  ).orderBy(desc(orders.createdAt)).limit(200);

  return (
    <>
      <PageHeader title="Orders" desc="Orders placed through WhatsApp checkout." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {["all", ...ORDER_STATUSES].map((s) => (
            <Link key={s} href={s === "all" ? "/orders" : `/orders?status=${s}`} className={cn("whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition", (status ?? "all") === s ? "bg-brand-600 text-white" : "text-neutral-600 hover:bg-white")}>{s}</Link>
          ))}
        </div>
        <form className="relative sm:w-64">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input name="q" defaultValue={q} placeholder="Ref, name or phone" className="input !py-2 !pl-10" />
        </form>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b bg-neutral-50/60 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((o) => (
              <tr key={o.id} className="hover:bg-neutral-50/60">
                <td className="px-5 py-3"><Link href={`/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">{o.reference}</Link><p className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p></td>
                <td className="px-5 py-3"><p className="font-medium">{o.customerName}</p><p className="text-xs text-neutral-500">{o.phone}</p></td>
                <td className="px-5 py-3 text-neutral-600">{o.city}, {o.state}</td>
                <td className="px-5 py-3 text-neutral-600">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className="px-5 py-3 font-semibold">{naira(o.total)}</td>
                <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-500">No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
