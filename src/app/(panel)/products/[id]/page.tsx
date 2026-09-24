import { notFound } from "next/navigation";
import Link from "next/link";
import { storeUrl } from "@/lib/store";
import ProductForm from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [p, cats] = await Promise.all([
    db.query.products.findFirst({ where: eq(products.id, id) }),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
  ]);
  if (!p) notFound();
  return (
    <>
      <PageHeader title="Edit product" desc={p.name}>
        <a href={storeUrl(`/product/${p.slug}`)} target="_blank" rel="noreferrer" className="btn-outline !py-2"><ExternalLink className="h-4 w-4" /> View</a>
      </PageHeader>
      <ProductForm product={p} categories={cats} />
    </>
  );
}
