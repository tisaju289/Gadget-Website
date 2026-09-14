import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product/ProductCard";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { SectionShell } from "./SectionShell";
import type { Product, ProductLabel } from "@/data/products";

export function BestDeals() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * 260, behavior: "smooth" });

  const { data: settings } = useSiteSettings();
  const perRow = clampNumber((settings as Record<string, unknown> | null)?.home_featured_per_row, 6, 2, 8);

  // Only show categories that actually have at least one featured product.
  const { data: tabs = [] } = useQuery({
    queryKey: ["featured-tabs-categories-with-products"],
    queryFn: async () => {
      const [{ data: cats }, { data: featured }] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, slug, sort_order")
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("products")
          .select("category_id")
          .eq("is_active", true)
          .eq("is_featured", true),
      ]);
      const ids = new Set((featured ?? []).map((p) => p.category_id).filter(Boolean));
      return (cats ?? []).filter((c) => ids.has(c.id));
    },
  });

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const selected = activeCat ?? tabs[0]?.id ?? null;

  // Reset selection if active cat is no longer in tabs (e.g. after refetch)
  useEffect(() => {
    if (activeCat && !tabs.find((t) => t.id === activeCat)) setActiveCat(null);
  }, [tabs, activeCat]);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["featured-products", selected, perRow],
    enabled: !!selected,
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, brand, image_url, price, original_price, label, category_id")
        .eq("is_active", true)
        .eq("is_featured", true)
        .eq("category_id", selected!)
        .order("sort_order", { ascending: true })
        .limit(perRow * 3);
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        brand: r.brand ?? "",
        image: r.image_url ?? "",
        price: Number(r.price),
        originalPrice: r.original_price ? Number(r.original_price) : Number(r.price),
        label: (r.label as ProductLabel | null) ?? undefined,
      }));
    },
  });

  const renderedTabs = useMemo(() => tabs, [tabs]);
  if (renderedTabs.length === 0) return null;

  return (
    <SectionShell
      title="Featured Products"
      viewAllTo="/products"
      viewAllSearch={{ filter: "featured" }}
    >
      {/* Category tabs */}
      <div className="scrollbar-hide -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {renderedTabs.map((c) => {
          const isActive = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all md:text-sm ${
                isActive
                  ? "border-info bg-info/10 text-info"
                  : "border-border bg-background text-foreground/70 hover:border-foreground/30"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Slider */}
      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous"
          className="absolute left-1 top-1/2 z-10 flex -translate-y-1/2 rounded-full bg-primary p-2 text-primary-foreground shadow hover:bg-primary/90"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Next"
          className="absolute right-1 top-1/2 z-10 flex -translate-y-1/2 rounded-full bg-primary p-2 text-primary-foreground shadow hover:bg-primary/90"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={ref}
          className="scrollbar-hide flex gap-3 overflow-x-auto px-8 pb-2 md:gap-4 md:px-10"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] w-[180px] shrink-0 animate-pulse rounded-xl bg-secondary/40 md:w-[220px]"
              />
            ))
          ) : items.length === 0 ? (
            <div className="w-full py-10 text-center text-sm text-muted-foreground">
              No featured products in this category yet.
            </div>
          ) : (
            items.map((p) => (
              <div key={p.id} className="home-carousel-card shrink-0" style={{ "--home-cols": perRow } as CSSProperties}>
                <ProductCard product={p} />
              </div>
            ))
          )}
        </div>
      </div>
    </SectionShell>
  );
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
