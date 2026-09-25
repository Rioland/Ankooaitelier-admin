import { db } from "@/db";
import { admins } from "@/db/schema";
import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import AdminEditor from "@/components/admin/AdminEditor";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteAdmin } from "@/app/actions";
import { getSession } from "@/lib/auth";
import { Trash2 } from "lucide-react";

export default async function AdminsAdmin() {
  const [rows, session] = await Promise.all([
    db.select().from(admins).orderBy(asc(admins.createdAt)),
    getSession(),
  ]);
  return (
    <>
      <PageHeader title="Admins" desc="People who can sign in and manage the store."><AdminEditor /></PageHeader>
      <div className="card divide-y divide-neutral-100">
        {rows.map((a) => {
          const isYou = session?.uid === a.id;
          return (
            <div key={a.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">{a.name.charAt(0).toUpperCase()}</span>
                <div>
                  <p className="font-semibold">
                    {a.name}
                    {isYou && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 ring-1 ring-inset ring-brand-200">You</span>}
                  </p>
                  <p className="text-xs text-neutral-500">{a.email}</p>
                </div>
              </div>
              {!isYou && rows.length > 1 && (
                <form action={deleteAdmin}>
                  <input type="hidden" name="id" value={a.id} />
                  <ConfirmButton message={`Remove ${a.name}'s admin access?`} className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></ConfirmButton>
                </form>
              )}
            </div>
          );
        })}
      </div>
      {rows.length === 0 && <p className="card p-10 text-center text-neutral-500">No admins yet.</p>}
    </>
  );
}
