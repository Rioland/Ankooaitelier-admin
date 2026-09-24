import Sidebar from "@/components/admin/Sidebar";
import { db } from "@/db";
import { messages, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { count, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [[p], [m]] = await Promise.all([
    db.select({ n: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ n: count() }).from(messages).where(eq(messages.read, false)),
  ]);
  return (
    <div className="min-h-screen bg-[#f5f8f6]">
      <Sidebar pendingOrders={p?.n ?? 0} unread={m?.n ?? 0} />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
