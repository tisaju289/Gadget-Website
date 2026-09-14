# Nexio Admin Panel + Full Dynamic Site

Ekhon shob data hardcoded (`src/data/products.ts`, `src/data/categories.ts`). Eta Supabase database e nibo, ekta admin panel banabo jekhane login kore product/category/banner manage kora jabe, ar public site database theke read korbe.

## Scope

### 1. Database (Supabase migration)
- `categories` — name, slug, icon, sort_order
- `subcategories` — category_id, name, slug
- `products` — name, brand, slug, image_url, price, original_price, label, category_id, stock, is_active, is_featured, is_flash_sale, sort_order
- `banners` — title, subtitle, image_url, link_url, position (hero/mini/promo), is_active, sort_order
- `profiles` — user_id, display_name
- `user_roles` — user_id, role (`admin` | `user`) — separate table (security best practice)
- `has_role()` security-definer function
- RLS:
  - Public read on categories/subcategories/products/banners (where `is_active`)
  - Only admins can insert/update/delete
  - Users read/update own profile
- Trigger: auto-create profile on signup
- Trigger: `updated_at` auto-update

### 2. Auth
- Email + password (Lovable Cloud default; Google sign-in skip korchi karon tumi extra config chao na bolle bolba)
- `/login` page (login + signup tabs)
- `_authenticated` layout guard
- `_admin` nested guard (checks `has_role(uid, 'admin')`)
- First admin: manually `INSERT INTO user_roles` after first signup (ami tomake bolbo kibhabe)

### 3. Admin Panel — `/admin/*`
- `/admin` — dashboard (counts: products, categories, orders placeholder)
- `/admin/products` — list (table, search, filter), Add/Edit/Delete
- `/admin/products/new` + `/admin/products/$id` — form (name, brand, prices, image upload, category, label, flags)
- `/admin/categories` — list + CRUD + subcategory manage
- `/admin/banners` — list + CRUD (hero / mini / promo positions)
- Sidebar layout with nav

### 4. Image upload
- Supabase Storage bucket `product-images` (public read, admin write)
- Upload widget in product form

### 5. Public site refactor
- All home sections (`HeroSlider`, `ShopByCategory`, `MegaMenu`, `FlashSale`, `BestDeals`, `NewArrivals`) fetch from Supabase via server functions + TanStack Query
- Keep existing UI/design — only swap data source
- Loading skeletons

### 6. Server functions (TanStack `createServerFn`)
- `getHomeData` (public) — categories, banners, featured products, flash sale, new arrivals
- `adminListProducts`, `adminUpsertProduct`, `adminDeleteProduct` (admin-only via `requireSupabaseAuth` + role check)
- Same for categories + banners

## Out of scope (this round)
- Cart / checkout / payments
- Order management
- Product detail page
- Customer accounts UI
- Google OAuth

## Files
**New**
- `src/routes/login.tsx`
- `src/routes/_authenticated.tsx`
- `src/routes/_authenticated/_admin.tsx`
- `src/routes/_authenticated/_admin/admin.tsx` (dashboard)
- `src/routes/_authenticated/_admin/admin.products.tsx`
- `src/routes/_authenticated/_admin/admin.products.new.tsx`
- `src/routes/_authenticated/_admin/admin.products.$id.tsx`
- `src/routes/_authenticated/_admin/admin.categories.tsx`
- `src/routes/_authenticated/_admin/admin.banners.tsx`
- `src/components/admin/AdminSidebar.tsx`, `ProductForm.tsx`, `ImageUploader.tsx`
- `src/lib/home.functions.ts`, `src/lib/admin.functions.ts`
- `src/hooks/useAuth.ts`

**Modified**
- `src/routes/__root.tsx` — auth context, `onAuthStateChange` listener
- `src/router.tsx` — auth router context
- `src/start.ts` — `attachSupabaseAuth` middleware
- `src/routes/index.tsx` + all home components — DB-driven
- `src/components/layout/Header.tsx` — login/logout state, admin link

## Approach
Step-by-step (each step verified before next):
1. DB migration + storage bucket
2. Auth wiring + login page
3. Admin layout + dashboard
4. Products CRUD
5. Categories + Banners CRUD
6. Public site DB integration

Approve korle ami step-1 (migration) diye shuru korbo.