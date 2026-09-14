import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/product/ProductCard";
import { useSectionProducts } from "./useSectionProducts";

export function FlashSale() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  const { data: items = [], isLoading } = useSectionProducts("is_flash_sale", 12);

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 md:px-4 md:py-6">
      <div
        className="relative overflow-hidden rounded-2xl shadow-[var(--shadow-card)]"
        style={{
          background:
            "radial-gradient(ellipse at left, color-mix(in oklab, var(--primary) 85%, white 15%) 0%, var(--primary) 55%, color-mix(in oklab, var(--primary) 40%, black 60%) 100%)",
        }}
      >
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[260px_minmax(0,1fr)] md:gap-2 md:p-6">
          {/* Left panel */}
          <div className="flex flex-col items-center text-center text-white md:items-start md:text-left md:pr-4 md:justify-center">
            <h2 className="text-2xl font-extrabold uppercase leading-tight tracking-wide md:text-3xl">
              This Week's
              <br />
              Must-Have
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/85 md:text-base">
              Trending Gadgets,
              <br className="hidden md:block" /> Carefully Chosen for You
            </p>
            <Link
              to="/products"
              search={{ filter: "flash_sale" } as never}
              className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white shadow transition-transform hover:scale-[1.03]"
            >
              Go Shopping
              <ChevronsRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right carousel */}
          <div className="relative min-w-0 overflow-hidden">
            <button
              onClick={() => scroll(-1)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 rounded-full bg-primary p-2 text-primary-foreground shadow hover:bg-primary/90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Next"
              className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 rounded-full bg-primary p-2 text-primary-foreground shadow hover:bg-primary/90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              ref={ref}
              className="scrollbar-hide flex gap-3 overflow-x-auto px-8 pb-1 md:gap-4 md:px-10"
            >
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[300px] w-[180px] shrink-0 animate-pulse rounded-xl bg-white/30 md:w-[220px]"
                    />
                  ))
                : items.map((p) => (
                    <div key={p.id} className="w-[170px] shrink-0 md:w-[220px]">
                      <ProductCard product={p} />
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
