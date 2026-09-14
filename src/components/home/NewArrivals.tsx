import { useRef } from "react";
import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { useSectionProducts } from "./useSectionProducts";
import { SectionShell } from "./SectionShell";
import banner from "@/assets/new-arrival-banner.jpg";

export function NewArrivals() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  const { data: settings } = useSiteSettings();
  const perRow = clampNumber((settings as Record<string, unknown> | null)?.home_new_arrivals_per_row, 6, 2, 8);
  const { data: items = [], isLoading } = useSectionProducts("is_new_arrival", perRow * 3);

  if (!isLoading && items.length === 0) return null;

  return (
    <SectionShell
      title="New Arrivals"
      viewAllTo="/products"
      viewAllSearch={{ filter: "new_arrivals" }}
    >
      <div className="mb-4 overflow-hidden rounded-xl">
        <img
          src={banner}
          alt="New Arrivals"
          loading="lazy"
          width={1920}
          height={540}
          className="h-32 w-full object-cover sm:h-36 md:h-40"
        />
      </div>

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
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[320px] w-[170px] shrink-0 animate-pulse rounded-xl bg-secondary/40 md:w-[220px]"
                />
              ))
            : items.map((p) => (
                <div key={p.id} className="home-carousel-card shrink-0" style={{ "--home-cols": perRow } as CSSProperties}>
                  <ProductCard product={{ ...p, label: p.label ?? "New Arrival" }} />
                </div>
              ))}
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
