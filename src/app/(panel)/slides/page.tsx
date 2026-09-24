import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import SlideEditor from "@/components/admin/SlideEditor";
import ConfirmButton from "@/components/admin/ConfirmButton";
import SafeImage from "@/components/SafeImage";
import { deleteSlide } from "@/app/actions";
import { Trash2 } from "lucide-react";

export default async function SlidesAdmin() {
  const rows = await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder));
  return (
    <>
      <PageHeader title="Hero slides" desc="The animated banners at the top of your homepage."><SlideEditor /></PageHeader>
      <div className="space-y-4">
        {rows.map((s) => (
          <div key={s.id} className="card flex flex-col overflow-hidden sm:flex-row">
            <div className="relative h-40 shrink-0 bg-brand-900 sm:h-auto sm:w-72">
              <SafeImage src={s.image} alt="" fill sizes="300px" className="object-cover" />
              {!s.active && <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">Hidden</span>}
            </div>
            <div className="flex flex-1 items-start justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{s.eyebrow}</p>
                <p className="mt-1 font-display text-2xl">{s.title}</p>
                <p className="mt-1 text-sm text-neutral-500">{s.subtitle}</p>
                <p className="mt-3 text-xs text-neutral-400">Button: “{s.ctaLabel}” → {s.ctaHref} · Order {s.sortOrder}</p>
              </div>
              <div className="flex">
                <SlideEditor slide={s} />
                <form action={deleteSlide}><input type="hidden" name="id" value={s.id} /><ConfirmButton message="Delete this slide?" className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></ConfirmButton></form>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="card p-10 text-center text-neutral-500">No slides yet — add one to show a hero banner.</p>}
      </div>
    </>
  );
}
