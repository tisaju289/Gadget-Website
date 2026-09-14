import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Package } from "lucide-react";
import { proxyImg } from "@/lib/img";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "All Brands — Nexio" },
      { name: "description", content: "Shop by your favorite brands at Nexio Bangladesh." },
      { property: "og:title", content: "All Brands — Nexio" },
      { property: "og:description", content: "Browse all official brands available at Nexio." },
    ],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const { data: brands, isLoading } = useQuery({
    queryKey: ["all-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, slug, image_url")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const items = brands ?? [];

  return (
    <div className="min-h-screen bg-secondary/40">
      <TopBar />
      <Header />
      <MegaMenu />

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">All Brands</span>
        </nav>

        <h1 className="mb-2 text-2xl font-bold md:text-3xl">All Brands</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {items.length} brand{items.length === 1 ? "" : "s"} available
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
            {items.map((b) => (
              <Link
                key={b.id}
                to="/brand/$slug"
                params={{ slug: b.slug }}
                className="group flex h-28 items-center justify-center rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-neon hover:shadow-[var(--shadow-card-hover)]"
              >
                {b.image_url ? (
                  <img src={proxyImg(b.image_url, 240)} alt={b.name} loading="lazy" decoding="async" className="max-h-16 max-w-full object-contain transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Package className="h-8 w-8" />
                    <span className="line-clamp-1 text-xs font-semibold">{b.name}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
