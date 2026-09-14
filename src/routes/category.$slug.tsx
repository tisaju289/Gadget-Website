import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { ShopBrowser } from "@/components/shop/ShopBrowser";

const searchSchema = z.object({
  sub: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/category/$slug")({
  validateSearch: zodValidator(searchSchema),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { sub } = Route.useSearch();

  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategory } = useQuery({
    queryKey: ["subcategory", category?.id, sub],
    enabled: !!category?.id && !!sub,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name, slug")
        .eq("category_id", category!.id)
        .eq("slug", sub)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["category-products", category?.id, subcategory?.id ?? null],
    enabled: !!category?.id && (!sub || !!subcategory?.id),
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id, name, slug, brand, image_url, price, original_price, label, stock, created_at")
        .eq("category_id", category!.id)
        .eq("is_active", true)
        .order("sort_order");
      if (subcategory?.id) q = q.eq("subcategory_id", subcategory.id);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const heading = subcategory?.name ?? category?.name ?? slug;

  return (
    <div className="min-h-screen bg-secondary/30">
      <TopBar />
      <Header />
      <MegaMenu />

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/categories" className="hover:text-foreground">Categories</Link>
          <ChevronRight className="h-3 w-3" />
          {subcategory ? (
            <>
              <Link to="/category/$slug" params={{ slug }} className="hover:text-foreground">
                {category?.name ?? slug}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-foreground">{subcategory.name}</span>
            </>
          ) : (
            <span className="font-medium text-foreground">{category?.name ?? slug}</span>
          )}
        </nav>

        <h1 className="mb-5 flex items-center gap-2 text-xl font-bold md:text-2xl">
          <span className="text-sale">»</span> {heading}
        </h1>

        <ShopBrowser
          products={products ?? []}
          isLoading={isLoading}
          activeCategorySlug={slug}
        />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
