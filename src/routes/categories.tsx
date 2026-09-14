import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Smartphone, Tablet, Laptop, Watch, Headphones, Speaker, Cable, Tv, Cpu, Battery, ShieldCheck, Music, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { proxyImg } from "@/lib/img";

const iconMap: Record<string, LucideIcon> = {
  smartphone: Smartphone, phone: Smartphone, phones: Smartphone,
  tablet: Tablet, laptop: Laptop, watch: Watch, smartwatch: Watch,
  headphones: Headphones, airpods: Headphones, earbuds: Music,
  speaker: Speaker, sounds: Speaker, music: Music,
  cable: Cable, accessories: Cable, tv: Tv, smarttv: Tv,
  cpu: Cpu, gadget: Cpu, gadgets: Cpu,
  battery: Battery, powerbank: Battery,
  shield: ShieldCheck, shieldcheck: ShieldCheck, case: ShieldCheck,
};

function resolveIcon(name?: string | null, catName?: string): LucideIcon {
  const k = (name || catName || "").toLowerCase().replace(/[\s_-]/g, "");
  return iconMap[k] || Package;
}

type CategoryWithSubs = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  subcategories: { id: string; name: string; slug: string }[];
  productCount: number;
};

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Categories — Nexio" },
      { name: "description", content: "Browse all product categories at Nexio Bangladesh. Smartphones, laptops, tablets, accessories and more." },
      { property: "og:title", content: "All Categories — Nexio" },
      { property: "og:description", content: "Browse all product categories at Nexio Bangladesh." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories-page"],
    queryFn: async (): Promise<CategoryWithSubs[]> => {
      const { data: cats, error } = await supabase
        .from("categories")
        .select("id, name, slug, icon, image_url, sort_order, subcategories(id, name, slug, sort_order, is_active)")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;

      const mapped = (cats ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        image_url: c.image_url,
        subcategories: ((c.subcategories ?? []) as { id: string; name: string; slug: string; sort_order: number; is_active: boolean }[])
          .filter((s) => s.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
      }));

      const counts = await Promise.all(
        mapped.map(async (c) => {
          const { count } = await supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("category_id", c.id)
            .eq("is_active", true);
          return { ...c, productCount: count ?? 0 };
        })
      );
      return counts;
    },
  });

  const items = categories ?? [];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <MegaMenu />

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">All Categories</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-2xl font-bold md:text-3xl">All Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse {items.length} categories and find exactly what you need
          </p>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[200px] animate-pulse rounded-xl border bg-secondary/40" />
            ))}
          </div>
        )}

        {items.length === 0 && !isLoading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 text-muted-foreground">No categories found</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {items.map((cat) => {
            const Icon = resolveIcon(cat.icon, cat.name);
            return (
              <Link
                key={cat.id}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="group flex aspect-square flex-col items-center justify-between gap-2 rounded-2xl bg-secondary/60 p-4 text-center transition-all hover:-translate-y-1 hover:bg-secondary hover:shadow-md"
              >
                <div className="flex flex-1 items-center justify-center">
                  {cat.image_url ? (
                    <img
                      src={proxyImg(cat.image_url, 200)}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="max-h-20 max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <Icon className="h-12 w-12 text-muted-foreground/70 transition-colors group-hover:text-foreground" />
                  )}
                </div>
                <h3 className="text-sm font-medium leading-tight text-foreground">
                  {cat.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
