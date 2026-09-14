import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { Loader2, LayoutDashboard, Package, Tag, Image as ImageIcon, LogOut, Home, Award, ListTree, Settings, ShoppingBag, Menu, X, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function BrandMark({ size = "lg" }: { size?: "lg" | "sm" }) {
  const { data } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("site_name, logo_url")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });
  const name = data?.site_name || "Nexio";
  const logo = data?.logo_url;
  const textCls = size === "lg" ? "text-xl" : "text-lg";
  const badgeCls =
    size === "lg" ? "text-[10px] ml-2" : "text-[9px] ml-1";
  const imgCls = size === "lg" ? "h-8" : "h-7";
  return (
    <div className={`flex items-center gap-2 font-extrabold ${textCls}`}>
      {logo ? (
        <img src={logo} alt={name} className={`${imgCls} w-auto object-contain`} />
      ) : (
        <span className="truncate">{name}</span>
      )}
      <span className={`rounded bg-primary px-1.5 py-0.5 font-bold text-primary-foreground ${badgeCls}`}>
        ADMIN
      </span>
    </div>
  );
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/preorders", label: "Pre-Orders", icon: Zap },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/subcategories", label: "Subcategories", icon: ListTree },
  { to: "/admin/brands", label: "Brands", icon: Award },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { isAdmin, loading, signOut, user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">Admin access required</h1>
        <p className="text-sm text-muted-foreground">
          Your account ({user?.email}) does not have admin privileges.
        </p>
        <Link to="/" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-secondary/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <BrandMark size="lg" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <Link to="/" className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-secondary">
            <Home className="h-4 w-4" /> View Store
          </Link>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background shadow-sm active:scale-95 transition"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[82%] max-w-xs p-0 flex flex-col">
              <div className="flex h-16 items-center border-b px-5">
                <BrandMark size="sm" />
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {navItems.map((item) => {
                  const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t p-3">
                <Link to="/" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-secondary">
                  <Home className="h-4 w-4" /> View Store
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <BrandMark size="sm" />
          </div>

          <Link
            to="/"
            aria-label="View store"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-background shadow-sm active:scale-95 transition"
          >
            <Home className="h-[18px] w-[18px]" />
          </Link>
        </header>

        {/* Mobile section pill scroller — current section title */}
        <div className="md:hidden border-b bg-secondary/30 px-3 py-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-background text-muted-foreground border"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
