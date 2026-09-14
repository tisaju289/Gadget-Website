import { Search, ShoppingCart, Zap, Menu, Shield, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { cart, cartCount, useCart } from "@/lib/cart";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { MobileMenuSheet } from "./MobileMenuSheet";

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const [q, setQ] = useState("");
  const [mq, setMq] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, signOut, user } = useAuth();
  const { items } = useCart();
  const count = cartCount(items);

  const submitSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    navigate({ to: "/products", search: { q: t } as never });
  };

  const { data: settings } = useSiteSettings();

  const siteName = settings?.site_name ?? "Nexio";
  const logoUrl = settings?.logo_url;
  const showSearch = settings?.show_header_search !== false;
  const showPreorder = settings?.show_preorder_btn !== false;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-20 md:gap-6">
        <button
          onClick={() => {
            setMenuOpen(true);
            onMenuToggle?.();
          }}
          className="rounded-md p-2 hover:bg-secondary md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <MobileMenuSheet open={menuOpen} onOpenChange={setMenuOpen} />

        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          {logoUrl && (
            <img src={logoUrl} alt={siteName} className="h-9 w-auto md:h-11" />
          )}
          <span>{siteName}</span>
        </Link>

        {showSearch && (
          <div className="hidden flex-1 md:block">
            <form
              onSubmit={(e) => { e.preventDefault(); submitSearch(q); }}
              className="flex h-11 items-center overflow-hidden rounded-full border bg-secondary/50 pl-1 pr-1 transition-colors focus-within:border-primary"
            >
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                type="text"
                placeholder="Search for products, brands and more..."
                className="h-9 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 md:gap-3">
          <button
            type="button"
            onClick={() => cart.openDrawer()}
            className="relative inline-flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-secondary"
            aria-label="Open cart"
          >
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-sale-foreground">
                {count}
              </span>
            </span>
            <span className="hidden lg:inline">Cart</span>
          </button>

          {isAdmin && (
            <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Shield className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          {isAuthenticated && (
            <button
              onClick={() => signOut()}
              className="hidden items-center gap-1.5 rounded-md p-2 text-sm font-medium hover:bg-secondary sm:inline-flex"
              title={user?.email ?? ""}
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          )}

          {showPreorder && (
            <Link
              to="/preorder"
              className="hidden items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:inline-flex"
            >
              <Zap className="h-4 w-4 fill-sale text-sale" />
              Pre-Order
            </Link>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="md:hidden mx-auto flex max-w-7xl items-center px-4 pb-3">
          <form
            onSubmit={(e) => { e.preventDefault(); submitSearch(mq); }}
            className="flex h-10 w-full items-center overflow-hidden rounded-full border bg-secondary/50 pl-3 pr-1"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={mq}
              onChange={(e) => setMq(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="h-full flex-1 bg-transparent px-2 text-sm outline-none"
            />
            <button type="submit" className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground">Go</button>
          </form>
        </div>
      )}
    </header>
  );
}
