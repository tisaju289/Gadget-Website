import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import type { CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";
import { proxyImg } from "@/lib/img";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { SectionShell } from "./SectionShell";

export function ShopByBrands() {
  const { data: settings } = useSiteSettings();
  const settingRecord = (settings ?? {}) as Record<string, unknown>;
  const limit = clampNumber(settingRecord.home_brand_limit, 8, 2, 16);
  const perRow = clampNumber(settingRecord.home_brand_per_row, 4, 2, 6);

  const { data: brands } = useQuery({
    queryKey: ["shop-by-brands", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, slug, image_url, sort_order")
        .eq("is_active", true)
        .order("sort_order")
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });

  const items = brands ?? [];

  return (
    <SectionShell title="Shop by Brands" viewAllTo="/brands" viewAllLabel="See all brands">
      <div className="home-grid-controlled grid gap-2.5 md:gap-3" style={{ "--home-cols": perRow } as CSSProperties}>
        {items.length === 0
          ? Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border bg-secondary/40" />
            ))
          : items.map((b) => (
              <Link
                key={b.id}
                to="/brand/$slug"
                params={{ slug: b.slug }}
                className="group flex h-20 items-center justify-center rounded-xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-neon hover:shadow-[var(--shadow-card-hover)]"
              >
                {b.image_url ? (
                  <img
                    src={proxyImg(b.image_url, 200)}
                    alt={b.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Package className="h-6 w-6" />
                    <span className="line-clamp-1 text-xs font-semibold">{b.name}</span>
                  </div>
                )}
              </Link>
            ))}
      </div>
    </SectionShell>
  );
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
