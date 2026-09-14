import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { ShopBrowser } from "@/components/shop/ShopBrowser";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "All Products — Nexio" },
      { name: "description", content: "Browse all products at Nexio Bangladesh. Flash sales, best deals, new arrivals and more." },
      { property: "og:title", content: "All Products — Nexio" },
      { property: "og:description", content: "Browse all products at Nexio Bangladesh." },
    ],
  }),
  component: ProductsPage,
});

function getFilterInfo(filter?: string) {
  switch (filter) {
    case "flash_sale":
      return { title: "Flash Sale Products", subtitle: "Hurry up! These deals end soon", metaTitle: "Flash Sale — Nexio" };
    case "best_deals":
      return { title: "Best Deal Products", subtitle: "Handpicked deals you can't miss", metaTitle: "Best Deals — Nexio" };
    case "new_arrivals":
      return { title: "Recently Added", subtitle: "Fresh in store this week", metaTitle: "New Arrivals — Nexio" };
    default:
      return { title: "All Products", subtitle: "Browse our complete collection", metaTitle: "All Products — Nexio" };
  }
}

function ProductsPage() {
  const search = Route.useSearch() as { filter?: string; q?: string };
  const filter = search.filter;
  const q = (search.q ?? "").trim();
  const info = q
    ? { title: `Search results for "${q}"`, subtitle: "Matching products from our catalog", metaTitle: `Search: ${q} — Nexio` }
    : getFilterInfo(filter);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-page", filter, q],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id, name, slug, brand, image_url, price, original_price, label, stock, created_at")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (filter === "flash_sale") query = query.eq("is_flash_sale", true);
      if (filter === "best_deals") query = query.eq("is_featured", true);
      if (filter === "new_arrivals") query = query.eq("is_new_arrival", true);

      if (q) {
        const term = `%${q.replace(/[%,()]/g, " ")}%`;
        query = query.or(
          `name.ilike.${term},brand.ilike.${term},description.ilike.${term},sku.ilike.${term},slug.ilike.${term}`
        );
      }

      const { data, error } = await query.limit(96);
      if (error) throw error;
      return data ?? [];
    },
  });

  const items = (products ?? []).map((p) => ({
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    brand: p.brand ?? null,
    image_url: p.image_url ?? null,
    price: Number(p.price),
    original_price: p.original_price != null ? Number(p.original_price) : null,
    label: p.label ?? null,
    stock: Number(p.stock ?? 0),
    created_at: p.created_at ?? undefined,
  }));

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <MegaMenu />

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {filter && (
            <>
              <Link to="/products" className="hover:text-foreground">All Products</Link>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="font-medium text-foreground">{info.title}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">{info.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{info.subtitle}</p>
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to="/products"
            search={{}}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !filter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All Products
          </Link>
          <Link
            to="/products"
            search={{ filter: "flash_sale" }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "flash_sale" ? "bg-sale text-sale-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Flash Sale
          </Link>
          <Link
            to="/products"
            search={{ filter: "best_deals" }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "best_deals" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Best Deals
          </Link>
          <Link
            to="/products"
            search={{ filter: "new_arrivals" }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === "new_arrivals" ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Recently Added
          </Link>
        </div>

        <ShopBrowser products={items} isLoading={isLoading} />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
