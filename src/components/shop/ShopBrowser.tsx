import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Package, Eye, ShoppingCart, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { proxyImg } from "@/lib/img";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  image_url: string | null;
  price: number;
  original_price: number | null;
  label: string | null;
  stock: number;
  created_at?: string;
};

type Props = {
  products: Product[];
  isLoading?: boolean;
  /** category slug currently active (for sidebar highlight) */
  activeCategorySlug?: string;
};

type SortKey = "default" | "price_asc" | "price_desc" | "newest";

function formatBDT(n: number) {
  return `৳${Number(n).toLocaleString("en-BD")}`;
}

export function ShopBrowser({ products, isLoading, activeCategorySlug }: Props) {
  const [sort, setSort] = useState<SortKey>("default");

  const priceBounds = useMemo(() => {
    if (!products.length) return [0, 0] as [number, number];
    const prices = products.map((p) => Number(p.price)).filter((n) => !isNaN(n));
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))] as [number, number];
  }, [products]);

  const [range, setRange] = useState<[number, number] | null>(null);
  const [min, max] = range ?? priceBounds;

  const filtered = useMemo(() => {
    let list = products.filter((p) => Number(p.price) >= min && Number(p.price) <= max);
    if (sort === "price_asc") list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price_desc") list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "newest")
      list = [...list].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    return list;
  }, [products, min, max, sort]);

  return (
    <div className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)] md:gap-6">
      {/* Sidebar (desktop) */}
      <aside className="hidden space-y-4 md:block">
        <PriceFilter
          priceBounds={priceBounds}
          min={min}
          max={max}
          onChange={(v) => setRange(v)}
        />
        <CategoriesSidebar activeSlug={activeCategorySlug} />
      </aside>

      {/* Products */}
      <section className="min-w-0">
        {/* Desktop sort bar */}
        <div className="mb-4 hidden flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-[var(--shadow-card)] md:flex">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> result
            {filtered.length === 1 ? "" : "s"}
          </p>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-[180px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default sorting</SelectItem>
              <SelectItem value="newest">Sort by latest</SelectItem>
              <SelectItem value="price_asc">Price: low to high</SelectItem>
              <SelectItem value="price_desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile filter + sort bar */}
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 shadow-[var(--shadow-card)] md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] overflow-y-auto sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <PriceFilter
                  priceBounds={priceBounds}
                  min={min}
                  max={max}
                  onChange={(v) => setRange(v)}
                />
                <CategoriesSidebar activeSlug={activeCategorySlug} />
              </div>
            </SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-auto gap-2 border-0 bg-transparent px-2 text-sm shadow-none focus:ring-0">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="newest">Latest</SelectItem>
              <SelectItem value="price_asc">Price: low to high</SelectItem>
              <SelectItem value="price_desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
        </div>



        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[320px] animate-pulse rounded-xl border bg-secondary/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border bg-card text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {filtered.map((p) => {
              const pct =
                p.original_price && p.original_price > p.price
                  ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
                  : 0;
              return (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary/40">
                    {pct > 0 && (
                      <span className="absolute left-3 top-3 z-10 rounded-md bg-success px-2 py-1 text-xs font-bold text-success-foreground shadow">
                        -{pct}%
                      </span>
                    )}
                    {p.image_url ? (
                      <img
                        src={proxyImg(p.image_url, 500)}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-14 w-14 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 p-3">
                    {p.brand && (
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {p.brand}
                      </p>
                    )}
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground">
                      {p.name}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-base font-bold text-sale">{formatBDT(p.price)}</span>
                      {p.original_price && p.original_price > p.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatBDT(p.original_price)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <span className="inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 text-[11px] font-semibold uppercase text-foreground hover:bg-secondary">
                        <Eye className="h-3 w-3" />
                        View
                      </span>
                      <span
                        className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase text-primary-foreground ${
                          p.stock > 0 ? "bg-primary hover:bg-primary/90" : "bg-muted opacity-60"
                        }`}
                      >
                        <ShoppingCart className="h-3 w-3" />
                        {p.stock > 0 ? "Add" : "Out"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function CategoriesSidebar({ activeSlug }: { activeSlug?: string }) {
  const { data: cats } = useQuery({
    queryKey: ["sidebar-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: subs } = useQuery({
    queryKey: ["sidebar-subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name, slug, category_id, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="rounded-xl border bg-card p-4 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">
        Product Categories
      </h3>
      <ul className="space-y-1">
        {(cats ?? []).map((c) => {
          const cSubs = (subs ?? []).filter((s) => s.category_id === c.id);
          const isActive = activeSlug === c.slug;
          const isOpen = open[c.id] ?? isActive;
          return (
            <li key={c.id}>
              <div className="flex items-center">
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className={`flex-1 truncate rounded px-2 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-sale"
                      : "text-foreground/80 hover:text-neon"
                  }`}
                >
                  {c.name}
                </Link>
                {cSubs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpen((s) => ({ ...s, [c.id]: !isOpen }))}
                    className="rounded p-1 text-muted-foreground hover:bg-secondary"
                    aria-label="Toggle subcategories"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              {isOpen && cSubs.length > 0 && (
                <ul className="ml-3 mt-1 space-y-0.5 border-l pl-3">
                  {cSubs.map((s) => (
                    <li key={s.id}>
                      <Link
                        to="/category/$slug"
                        params={{ slug: c.slug }}
                        search={{ sub: s.slug } as never}
                        className="block truncate rounded px-2 py-1 text-xs text-muted-foreground hover:text-neon"
                      >
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PriceFilter({
  priceBounds,
  min,
  max,
  onChange,
}: {
  priceBounds: [number, number];
  min: number;
  max: number;
  onChange: (v: [number, number]) => void;
}) {
  const bMin = priceBounds[0];
  const bMax = priceBounds[1];
  const [draft, setDraft] = useState<[number, number]>([min, max]);

  useEffect(() => {
    setDraft([min, max]);
  }, [min, max, bMin, bMax]);

  const updateMin = (value: number) => {
    const next = clampNumber(value, bMin, draft[1]);
    setDraft([next, draft[1]]);
  };

  const updateMax = (value: number) => {
    const next = clampNumber(value, draft[0], bMax);
    setDraft([draft[0], next]);
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground">Price</h3>
      {bMax > bMin ? (
        <div className="space-y-4">
          <Slider
            min={bMin}
            max={bMax}
            step={1}
            value={draft}
            onValueChange={(v) => setDraft([Math.min(v[0], v[1]), Math.max(v[0], v[1])] as [number, number])}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Min</span>
              <input
                type="number"
                min={bMin}
                max={draft[1]}
                value={draft[0]}
                onChange={(e) => updateMin(Number(e.target.value))}
                className="h-9 w-full rounded-lg border bg-background px-2 text-sm font-semibold outline-none focus:border-primary"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground">Max</span>
              <input
                type="number"
                min={draft[0]}
                max={bMax}
                value={draft[1]}
                onChange={(e) => updateMax(Number(e.target.value))}
                className="h-9 w-full rounded-lg border bg-background px-2 text-sm font-semibold outline-none focus:border-primary"
              />
            </label>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-muted-foreground">Price: <span className="font-semibold text-foreground">{formatBDT(draft[0])}</span> — <span className="font-semibold text-foreground">{formatBDT(draft[1])}</span></span>
            <button
              type="button"
              onClick={() => onChange(draft)}
              className="rounded-md border bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Filter
            </button>
          </div>
          {(min !== bMin || max !== bMax) && (
            <button
              type="button"
              onClick={() => { setDraft([bMin, bMax]); onChange([bMin, bMax]); }}
              className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No price range available</p>
      )}
    </div>
  );
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}
