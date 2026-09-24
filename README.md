# Ankooaitelier Admin

The admin panel for the Ankooaitelier store, deployed separately from the storefront. Both apps share the same Neon database and Vercel Blob store.

Next.js 15 (App Router) · Tailwind CSS v4 · Framer Motion · Drizzle ORM · Neon Postgres · Vercel Blob

Dashboard with revenue and a 14-day sales chart, orders, products, categories, hero slides, messages and subscribers, and store settings.

## Deploy on Vercel

1. Push this folder to its own GitHub repo, then **Add New → Project** in Vercel and import it.
2. **Storage:** connect the **same** Neon database and the **same** Blob store the storefront uses (Storage → Connect existing). This adds `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`.
3. **Environment variables:** `ADMIN_EMAIL`, `ADMIN_PASSWORD` (plain text or a bcrypt hash), `AUTH_SECRET` (`openssl rand -base64 32`) and `NEXT_PUBLIC_STORE_URL` (e.g. `https://ankoo.vercel.app`).
4. Deploy, then open `/login`. Optionally add a custom domain such as `admin.ankoo.ng`.

The database tables are created from the storefront project (`npm run db:push` there). `src/db/schema.ts` here is a copy: if you change the schema, change it in both projects.

## Local development

```bash
cp .env.example .env   # same DATABASE_URL as the storefront
npm install
npm run dev            # http://localhost:3001  (storefront runs on :3000)
```
Without a Blob token, uploads made in dev are saved to this app's `public/uploads`, so the storefront won't show them. Set `BLOB_READ_WRITE_TOKEN` if you want uploads to appear in the store locally.
