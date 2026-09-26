# Deploy CryoLink on Vercel

## 1. Database (required)

Vercel is serverless — **SQLite files do not work**. Use **Neon Postgres** (free):

1. In [Vercel](https://vercel.com) → your project → **Storage** → **Create** → **Neon** (or connect [neon.tech](https://neon.tech)).
2. Attach the database to the project. Vercel sets `DATABASE_URL` (and often `DIRECT_URL` for migrations).

## 2. Import the repo

1. **Add New Project** → import `chin-mayi21/polar-expedition` (or your fork).
2. Framework: **Next.js** (auto-detected).
3. Build command: leave default — Vercel runs `npm run vercel-build` when that script exists.

## 3. Environment variables

| Variable | Value |
|----------|--------|
| `AUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `AUTH_URL` | `https://YOUR-PROJECT.vercel.app` (no trailing slash) |
| `DATABASE_URL` | From Neon (set automatically if linked) |
Optional Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (callback: `https://YOUR-PROJECT.vercel.app/api/auth/callback/google`).

## 4. Deploy

Deploy once. The build runs `prisma db push` and **seeds demo users** if the database is empty.

**Demo login:** `demo-official@ncpor.test` / `demo1234` (same for field & family demos).

## 5. Local dev with Postgres

Point `.env` at the same Neon **dev** branch or a local Postgres:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # non-pooled URL if Neon requires it
AUTH_SECRET="local-dev-secret"
```

Then: `npx prisma db push` and `npm run db:seed`.
