import { db } from "@/db";
import { messages, subscribers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { deleteMessage, markMessageRead } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Check, Trash2 } from "lucide-react";

export default async function MessagesAdmin() {
  const [msgs, subs] = await Promise.all([
    db.select().from(messages).orderBy(desc(messages.createdAt)).limit(200),
    db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(500),
  ]);
  return (
    <>
      <PageHeader title="Messages & subscribers" desc="Contact form messages and newsletter sign-ups." />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={cn("card p-5", !m.read && "border-brand-300 ring-2 ring-brand-100")}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{m.name} {!m.read && <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] text-white">NEW</span>}</p>
                  <p className="text-xs text-neutral-500"><a href={`mailto:${m.email}`} className="hover:text-brand-700">{m.email}</a>{m.phone && ` · ${m.phone}`} · {new Date(m.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
                </div>
                <div className="flex">
                  {!m.read && <form action={markMessageRead}><input type="hidden" name="id" value={m.id} /><button title="Mark as read" className="rounded-lg p-2 text-neutral-500 hover:bg-brand-50 hover:text-brand-700"><Check className="h-4 w-4" /></button></form>}
                  <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><button title="Delete" className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-neutral-700">{m.message}</p>
            </div>
          ))}
          {msgs.length === 0 && <p className="card p-10 text-center text-neutral-500">No messages yet.</p>}
        </div>
        <div className="card self-start overflow-hidden">
          <p className="border-b px-5 py-4 font-semibold">Subscribers ({subs.length})</p>
          <ul className="max-h-[60vh] divide-y overflow-y-auto text-sm">
            {subs.map((s) => <li key={s.id} className="flex justify-between px-5 py-2.5"><span>{s.email}</span><span className="text-xs text-neutral-400">{new Date(s.createdAt).toLocaleDateString("en-NG")}</span></li>)}
            {subs.length === 0 && <li className="px-5 py-6 text-neutral-500">No subscribers yet.</li>}
          </ul>
        </div>
      </div>
    </>
  );
}
