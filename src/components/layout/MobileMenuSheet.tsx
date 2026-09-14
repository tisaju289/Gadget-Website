import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Home,
  Store,
  Sparkles,
  Award,
  Flame,
  Newspaper,
  Truck,
  Package,
  ChevronRight,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const menuLinks: Array<{ to: string; label: string; icon: typeof Home; accent?: string }> = [
  { to: "/", label: "Home", icon: Home, accent: "text-primary" },
  { to: "/products", label: "Shop", icon: Store },
  { to: "/products", label: "Best Selling", icon: Sparkles },
  { to: "/products", label: "New Arrivals", icon: Newspaper },
  { to: "/brands", label: "Brands", icon: Award },
  { to: "/products", label: "HOT OFFER", icon: Flame, accent: "text-sale" },
  { to: "/preorder", label: "Pre Order", icon: Truck, accent: "text-primary" },
];

export function MobileMenuSheet({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<"menu" | "categories">("menu");

  const { data: categories } = useQuery({
    queryKey: ["mobile-menu-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] p-0 sm:max-w-sm">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 border-b bg-secondary/40">
          <button
            onClick={() => setTab("menu")}
            className={`py-4 text-sm font-bold tracking-wider transition-colors ${
              tab === "menu" ? "bg-background text-foreground" : "text-muted-foreground"
            }`}
          >
            MENU
          </button>
          <button
            onClick={() => setTab("categories")}
            className={`py-4 text-sm font-bold tracking-wider transition-colors ${
              tab === "categories" ? "bg-background text-foreground" : "text-muted-foreground"
            }`}
          >
            CATEGORIES
          </button>
        </div>

        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
          {tab === "menu" ? (
            <nav className="flex flex-col">
              {menuLinks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={close}
                    className="flex items-center gap-3 border-b px-4 py-3.5 text-sm font-medium hover:bg-secondary/60"
                  >
                    <Icon className={`h-5 w-5 ${item.accent ?? "text-muted-foreground"}`} />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </nav>
          ) : (
            <nav className="flex flex-col">
              {(categories ?? []).map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  onClick={close}
                  className="flex items-center gap-3 border-b px-4 py-3.5 text-sm font-medium hover:bg-secondary/60"
                >
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="h-6 w-6 object-contain" />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="flex-1">{c.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
              {(categories ?? []).length === 0 && (
                <div className="px-4 py-6 text-sm text-muted-foreground">No categories yet.</div>
              )}
            </nav>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
