import Link from "next/link";
import { storeUrl } from "@/lib/store";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ORDER_STATUSES, PageHeader, StatusBadge } from "@/components/admin/ui";
import SafeImage from "@/components/SafeImage";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteOrder, updateOrderStatus } from "@/app/actions";
import { naira, cn } from "@/lib/utils";
import { ArrowLeft, MessageCircle, Phone, Trash2 } from "lucide-react";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const o = await db.query.orders.findFirst({ where: eq(orders.id, Number((await params).id)) });
  if (!o) notFound();
  const phone = o.phone.replace(/\D/g, "").replace(/^0/, "234");
  const msg = encodeURIComponent(`Hi ${o.customerName.split(" ")[0]}, thanks for your order ${o.reference} (${naira(o.total)}). `);
  const idx = ORDER_STATUSES.indexOf(o.status);

  return (
    <>
      <Link href="/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> All orders</Link>
      <PageHeader title={`Order ${o.reference}`} desc={new Date(o.createdAt).toLocaleString("en-NG", { dateStyle: "full", timeStyle: "short" })}>
        <StatusBadge status={o.status} />
      </PageHeader>

      {o.status !== "cancelled" && (
        <div className="card mb-6 p-6">
          <div className="flex items-center">
            {ORDER_STATUSES.filter((s) => s !== "cancelled").map((s, i, arr) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={cn("grid h-8 w-8 place-items-center rounded-full text-xs font-bold", i <= idx ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-400")}>{i + 1}</span>
                  <span className={cn("text-[11px] font-medium capitalize", i <= idx ? "text-brand-700" : "text-neutral-400")}>{s}</span>
                </div>
                {i < arr.length - 1 && <div className={cn("mx-2 mb-5 h-0.5 flex-1 rounded", i < idx ? "bg-brand-500" : "bg-neutral-200")} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card overflow-hidden">
          <p className="border-b px-6 py-4 font-semibold">Items</p>
          <ul className="divide-y">
            {o.items.map((i, k) => (
              <li key={k} className="flex items-center gap-4 px-6 py-4">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-50"><SafeImage src={i.image} alt="" fill sizes="56px" className="object-cover" /></span>
                <div className="flex-1">
                  <a href={storeUrl(`/product/${i.slug}`)} target="_blank" rel="noreferrer" className="font-medium hover:text-brand-700">{i.name}</a>
                  <p className="text-xs text-neutral-500">{[i.size && `Size ${i.size}`, i.color].filter(Boolean).join(" · ")} · {naira(i.price)} × {i.quantity}</p>
                </div>
                <p className="font-semibold">{naira(i.price * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t bg-neutral-50/60 px-6 py-4 text-sm">
            <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{naira(o.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Delivery</span><span>{o.deliveryFee ? naira(o.deliveryFee) : "Free"}</span></div>
            <div className="flex justify-between pt-1 text-base font-semibold"><span>Total</span><span className="text-brand-800">{naira(o.total)}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card space-y-3 p-6 text-sm">
            <p className="font-semibold">Customer</p>
            <p className="text-base font-medium">{o.customerName}</p>
            <p className="text-neutral-600">{o.phone}{o.email && <><br />{o.email}</>}</p>
            <p className="text-neutral-600">{o.address}<br />{o.city}, {o.state}</p>
            {o.note && <p className="rounded-xl bg-amber-50 p-3 text-amber-900">📝 {o.note}</p>}
            <div className="flex gap-2 pt-2">
              <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noreferrer" className="btn flex-1 bg-[#25D366] !py-2.5 text-white hover:bg-[#1ebe5a]"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              <a href={`tel:${o.phone}`} className="btn-outline flex-1 !py-2.5"><Phone className="h-4 w-4" /> Call</a>
            </div>
          </div>
          <form action={updateOrderStatus} className="card space-y-3 p-6">
            <input type="hidden" name="id" value={o.id} />
            <label className="label">Update status</label>
            <select name="status" defaultValue={o.status} className="input capitalize">
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn-primary w-full">Save status</button>
          </form>
          <form action={deleteOrder}>
            <input type="hidden" name="id" value={o.id} />
            <ConfirmButton message="Delete this order permanently?" className="flex w-full items-center justify-center gap-2 rounded-full py-2 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete order</ConfirmButton>
          </form>
        </div>
      </div>
    </>
  );
}
