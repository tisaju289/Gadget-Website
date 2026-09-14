import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/useSiteSettings";

type CatWithSubs = {
  id: string;
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string }[];
};

type NavLink = { label: string; url: string };

const DEFAULT_NAV: NavLink[] = [
  { label: "Home", url: "/" },
  { label: "Shop", url: "/products" },
  { label: "Best Selling", url: "/products?filter=best_deals" },
  { label: "New Arrivals", url: "/products?filter=new_arrivals" },
  { label: "Hot Offer", url: "/products?filter=flash_sale" },
  { label: "Brands", url: "/brands" },
  { label: "Pre-Order", url: "/preorder" },
];

export function MegaMenu() {
  const [allOpen, setAllOpen] = useState(false);
  const [hoverCat, setHoverCat] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["megamenu", "categories"],
    queryFn: async (): Promise<CatWithSubs[]> => {
      const { data: cats, error } = await supabase
        .from("categories")
        .select("id, name, slug, sort_order, subcategories(id, name, slug, sort_order, is_active)")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (cats ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        subcategories: ((c.subcategories ?? []) as { id: string; name: string; slug: string; sort_order: number; is_active: boolean }[])
          .filter((s) => s.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
      }));
    },
  });

  const { data: settings } = useSiteSettings();
  const s = (settings ?? {}) as Record<string, unknown>;
  const hotline = (s.header_hotline as string) || "16263";
  const showHotline = s.show_hotline !== false;
  const rawLinks = Array.isArray(s.nav_links) ? (s.nav_links as NavLink[]) : [];
  const navCategoryLinks = Array.isArray(s.nav_category_links)
    ? (s.nav_category_links as { id: string; name: string; slug: string }[]).filter((c) => c && c.id && c.name && c.slug)
    : [];
  const navLinks = rawLinks.filter((l) => l && l.label && l.url);
  const linksToShow = navLinks.length > 0 ? navLinks : DEFAULT_NAV;

  if (settings && s.show_megamenu === false) return null;

  const all = categories ?? [];

  return (
    <nav className="hidden border-b bg-primary text-primary-foreground md:block">
      <div className="mx-auto flex max-w-7xl items-center px-4">
        <div
          className="relative mr-6 border-r border-white/10"
          onMouseEnter={() => setAllOpen(true)}
          onMouseLeave={() => { setAllOpen(false); setHoverCat(null); }}
        >
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 py-3 pr-6 text-sm font-semibold"
          >
            <LayoutGrid className="h-4 w-4" />
            All Categories
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </Link>

          {allOpen && all.length > 0 && (
            <div className="absolute left-0 top-full z-50 flex text-foreground">
              <div className="w-[280px] rounded-b-lg border border-t-0 bg-background py-2 shadow-xl">
                {all.map((cat) => (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setHoverCat(cat.id)}
                    className={`flex items-center justify-between ${hoverCat === cat.id ? "bg-secondary" : ""}`}
                  >
                    <Link
                      to="/category/$slug"
                      params={{ slug: cat.slug }}
                      className="flex-1 px-4 py-2 text-sm transition-colors hover:text-neon"
                    >
                      {cat.name}
                    </Link>
                    {cat.subcategories.length > 0 && (
                      <ChevronRight className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                ))}
                <div className="mx-4 my-2 border-t" />
                <Link
                  to="/categories"
                  className="block px-4 py-2 text-sm font-semibold text-sale transition-colors hover:bg-secondary"
                >
                  View All Categories →
                </Link>
              </div>

              {hoverCat && (() => {
                const cat = all.find((c) => c.id === hoverCat);
                if (!cat || cat.subcategories.length === 0) return null;
                return (
                  <div className="w-[360px] rounded-b-lg border border-l-0 border-t-0 bg-background p-4 shadow-xl">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {cat.name}
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to="/category/$slug"
                          params={{ slug: cat.slug }}
                          search={{ sub: sub.slug } as never}
                          className="rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary hover:text-neon"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <ul className="flex flex-1 items-center gap-1">
          {linksToShow.map((l, i) => (
            <li key={`${l.url}-${i}`}>
              <a
                href={l.url}
                className="inline-flex items-center px-4 py-3 text-sm font-medium uppercase tracking-wide transition-colors hover:text-neon"
              >
                {l.label}
              </a>
            </li>
          ))}
          {navCategoryLinks.map((cat) => (
            <li key={cat.id}>
              <Link
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="inline-flex items-center px-4 py-3 text-sm font-medium uppercase tracking-wide transition-colors hover:text-neon"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>

        {showHotline && (
          <span className="ml-auto inline-flex items-center gap-2 text-xs">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-sale" />
            Hotline: <strong>{hotline}</strong>
          </span>
        )}
      </div>
    </nav>
  );
}
