import Link from "next/link";
import { db } from "@/db";
import { orders, products, subscribers } from "@/db/schema";
import { and, count, desc, gte, lte, ne, sql, sum } from "drizzle-orm";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { naira } from "@/lib/utils";
import { ArrowUpRight, Banknote, Package, ShoppingCart, Users, AlertTriangle } from "lucide-react";
import SalesChart from "@/components/admin/SalesChart";

export default async function Dashboard() {
  const since = new Date(Date.now() - 13 * 864e5);
  since.setHours(0, 0, 0, 0);
  const [[rev], [ord], [prod], [subs], recent, lowStock, daily] = await Promise.all([
    db.select({ v: sum(orders.total) }).from(orders).where(ne(orders.status, "cancelled")),
    db.select({ n: count() }).from(orders),
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(subscribers),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
    db.select().from(products).where(and(lte(products.stock, 5))).orderBy(products.stock).limit(5),
    db
      .select({ day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`, total: sum(orders.total), n: count() })
      .from(orders)
      .where(and(gte(orders.createdAt, since), ne(orders.status, "cancelled")))
      .groupBy(sql`1`),
  ]);

  const series = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(since.getTime() + i * 864e5);
    const key = d.toISOString().slice(0, 10);
    const row = daily.find((r) => r.day === key);
    return { label: d.toLocaleDateString("en-NG", { day: "numeric", month: "short" }), value: Number(row?.total ?? 0), orders: Number(row?.n ?? 0) };
  });

  const stats = [
    { label: "Revenue", value: naira(Number(rev?.v ?? 0)), icon: Banknote, href: "/orders" },
    { label: "Orders", value: ord?.n ?? 0, icon: ShoppingCart, href: "/orders" },
    { label: "Products", value: prod?.n ?? 0, icon: Package, href: "/products" },
    { label: "Subscribers", value: subs?.n ?? 0, icon: Users, href: "/messages" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" desc="An overview of how your store is doing." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-900/5">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span>
              <ArrowUpRight className="h-4 w-4 text-neutral-300 transition group-hover:text-brand-600" />
            </div>
            <p className="mt-4 text-sm text-neutral-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Sales · last 14 days</p>
          <p className="text-sm text-neutral-500">{series.reduce((n, s) => n + s.orders, 0)} orders</p>
        </div>
        <SalesChart data={series} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <p className="font-semibold">Recent orders</p>
            <Link href="/orders" className="text-sm font-semibold text-brand-700">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">No orders yet. They'll appear here as customers check out.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-neutral-50">
                    <div>
                      <p className="text-sm font-semibold">{o.customerName}</p>
                      <p className="text-xs text-neutral-500">{o.reference} · {new Date(o.createdAt).toLocaleDateString("en-NG")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status} />
                      <span className="w-24 text-right text-sm font-semibold">{naira(o.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b px-6 py-4"><AlertTriangle className="h-4 w-4 text-amber-500" /><p className="font-semibold">Low stock</p></div>
          {lowStock.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">All products are well stocked.</p>
          ) : (
            <ul className="divide-y">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.id}`} className="flex items-center justify-between px-6 py-3.5 text-sm hover:bg-neutral-50">
                    <span className="line-clamp-1 font-medium">{p.name}</span>
                    <span className={p.stock === 0 ? "font-semibold text-red-600" : "font-semibold text-amber-600"}>{p.stock} left</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
