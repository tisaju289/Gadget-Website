# Setting up a new customer deployment

Each customer gets the same website with their own Supabase project.

## 1. Create the database

In the customer's Supabase project, open **SQL Editor** and run, in this order:

1. `database/schema.sql` — tables, security rules, triggers, storage bucket
2. `database/seed.sql` — categories, subcategories, brands, products, banners, site settings

## 2. Create the admin user

1. Supabase Dashboard → **Authentication → Users → Add user** (email + password,
   auto-confirm).
2. Back in the SQL Editor, run:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'admin@example.com'
on conflict (user_id, role) do nothing;
```

Optional: turn off "Confirm email" in Authentication → Providers → Email so
sign-in works immediately.

## 3. Configure the site

Copy `.env.example` to `.env` and fill in the customer's values:

```
VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID
SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_PROJECT_ID
```

## 4. Deploy to Cloudflare Workers

The `VITE_*` values are read at build time, so they must be present when you build:

```bash
bun install
bun run build
bunx wrangler deploy
```

Also bind the server-side values in Cloudflare (Worker → Settings → Variables):
`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`. Add `SUPABASE_SERVICE_ROLE_KEY`
only if you use privileged server operations — keep it secret.

Change the `name` field in `wrangler.jsonc` per customer so each deployment has
its own Worker.

## Notes

- `seed.sql` contains no orders, pre-orders, user accounts or secrets.
- Product/brand images referenced by the seed data are external URLs; uploaded
  images live in the `product-images` storage bucket, which `schema.sql` creates.
- Both files are safe to re-run; existing rows are skipped.
