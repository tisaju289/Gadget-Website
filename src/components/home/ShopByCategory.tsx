import { Package, Smartphone, Tablet, Laptop, Watch, Headphones, Speaker, Cable, Tv, Cpu, Battery, ShieldCheck, Music } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { proxyImg } from "@/lib/img";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { SectionShell } from "./SectionShell";

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

export function ShopByCategory() {
  const { data: settings } = useSiteSettings();
  const settingRecord = (settings ?? {}) as Record<string, unknown>;
  const limit = clampNumber(settingRecord.home_category_limit, 8, 2, 12);
  const perRow = clampNumber(settingRecord.home_category_per_row, 6, 2, 8);

  const { data: categories } = useQuery({
    queryKey: ["shop-by-category"],
    queryFn: async () => {
      const { data: cats, error } = await supabase
        .from("categories")
        .select("id, name, slug, icon, image_url, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return cats ?? [];
    },
  });

  const items = (categories ?? []).slice(0, limit);

  return (
    <SectionShell title="Featured Categories">
      <div className="home-grid-controlled grid gap-2.5 md:gap-3" style={{ "--home-cols": perRow } as CSSProperties}>
        {items.length === 0
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl border bg-secondary/40" />
            ))
          : items.map((c) => {
              const Icon = resolveIcon(c.icon, c.name);
              return (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group flex aspect-[4/3] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border bg-secondary/30 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-neon hover:bg-card hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg text-foreground/80 transition-colors group-hover:text-neon">
                    {c.image_url ? (
                      <img src={proxyImg(c.image_url, 96)} alt={c.name} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                    ) : (
                      <Icon className="h-8 w-8" strokeWidth={1.4} />
                    )}
                  </div>
                  <span className="line-clamp-1 text-xs font-semibold md:text-sm">{c.name}</span>
                </Link>
              );
            })}
      </div>
      {(categories ?? []).length > limit && (
        <div className="mt-4 flex justify-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 md:text-sm"
          >
            All Categories
          </Link>
        </div>
      )}
    </SectionShell>
  );
}


function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
