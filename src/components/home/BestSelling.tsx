import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product/ProductCard";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { SectionShell } from "./SectionShell";
import type { Product, ProductLabel } from "@/data/products";

export function BestSelling() {
  const { data: settings } = useSiteSettings();
  const perRow = clampNumber((settings as Record<string, unknown> | null)?.home_best_selling_per_row, 6, 2, 8);
  const itemLimit = perRow * 3;

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["home", "best-selling", itemLimit],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, brand, image_url, price, original_price, label")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(itemLimit);
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

  if (!isLoading && items.length === 0) return null;

  return (
    <SectionShell title="Best Selling Products">
      <div className="home-grid-controlled grid gap-3 md:gap-4" style={{ "--home-cols": perRow } as CSSProperties}>
        {isLoading
          ? Array.from({ length: itemLimit }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-secondary/40" />
            ))
          : items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          All Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </SectionShell>
  );
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
