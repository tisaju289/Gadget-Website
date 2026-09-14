import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Tag, Image as ImageIcon, TrendingUp, ShoppingBag, Zap, AlertTriangle, DollarSign, Layers, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

const fmt = (n: number) => "৳" + Math.round(n).toLocaleString("en-IN");

function DashboardPage() {
  const { data: counts } = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: async () => {
      const [p, c, sc, b, ban, fp, ord, pre] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("subcategories").select("id", { count: "exact", head: true }),
        supabase.from("brands").select("id", { count: "exact", head: true }),
        supabase.from("banners").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("preorders").select("id", { count: "exact", head: true }),
      ]);
      return {
        products: p.count ?? 0, categories: c.count ?? 0, subcategories: sc.count ?? 0,
        brands: b.count ?? 0, banners: ban.count ?? 0, featured: fp.count ?? 0,
        orders: ord.count ?? 0, preorders: pre.count ?? 0,
      };
    },
  });

  const { data: orderStats } = useQuery({
    queryKey: ["admin", "order-stats"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("total, status, created_at").order("created_at", { ascending: false }).limit(500);
      const rows = data ?? [];
      const now = Date.now();
      const dayMs = 86400000;
      const revenue = rows.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total ?? 0), 0);
      const today = rows.filter((o) => now - new Date(o.created_at).getTime() < dayMs).length;
      const week = rows.filter((o) => now - new Date(o.created_at).getTime() < 7 * dayMs).length;
      const pending = rows.filter((o) => o.status === "pending").length;
      const byStatus: Record<string, number> = {};
      rows.forEach((o) => { byStatus[o.status] = (byStatus[o.status] ?? 0) + 1; });
      return { revenue, today, week, pending, byStatus };
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin", "recent-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders")
        .select("id, order_number, customer_name, total, status, created_at")
        .order("created_at", { ascending: false }).limit(6);
      return data ?? [];
    },
  });

  const { data: lowStock } = useQuery({
    queryKey: ["admin", "low-stock"],
    queryFn: async () => {
      const { data } = await supabase.from("products")
        .select("id, name, stock, image_url, slug")
        .lte("stock", 5).eq("is_active", true)
        .order("stock", { ascending: true }).limit(6);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Revenue", value: orderStats ? fmt(orderStats.revenue) : "—", icon: DollarSign, color: "text-success", tint: "bg-success/10" },
    { label: "Orders", value: counts?.orders ?? "—", sub: orderStats ? `${orderStats.today} today` : "", icon: ShoppingBag, color: "text-primary", tint: "bg-primary/10" },
    { label: "Pending", value: orderStats?.pending ?? "—", icon: AlertTriangle, color: "text-warning", tint: "bg-warning/10" },
    { label: "Pre-orders", value: counts?.preorders ?? "—", icon: Zap, color: "text-info", tint: "bg-info/10" },
    { label: "Products", value: counts?.products ?? "—", icon: Package, color: "text-primary", tint: "bg-primary/10" },
    { label: "Categories", value: counts?.categories ?? "—", icon: Tag, color: "text-info", tint: "bg-info/10" },
    { label: "Subcategories", value: counts?.subcategories ?? "—", icon: Layers, color: "text-warning", tint: "bg-warning/10" },
    { label: "Brands", value: counts?.brands ?? "—", icon: Award, color: "text-success", tint: "bg-success/10" },
    { label: "Banners", value: counts?.banners ?? "—", icon: ImageIcon, color: "text-warning", tint: "bg-warning/10" },
    { label: "Featured", value: counts?.featured ?? "—", icon: TrendingUp, color: "text-success", tint: "bg-success/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back to Nexio admin</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</span>
                <div className={`grid h-7 w-7 place-items-center rounded-md ${c.tint}`}>
                  <Icon className={`h-4 w-4 ${c.color}`} />
                </div>
              </div>
              <div className="mt-2 text-xl font-bold">{c.value}</div>
              {c.sub && <div className="mt-0.5 text-[10px] text-muted-foreground">{c.sub}</div>}
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
          </div>
          {!recentOrders || recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <ul className="divide-y">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.customer_name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{o.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-sale">{fmt(Number(o.total))}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Low Stock Alert</h2>
            <Link to="/admin/products" className="text-xs font-semibold text-primary hover:underline">Manage →</Link>
          </div>
          {!lowStock || lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">All products well stocked 🎉</p>
          ) : (
            <ul className="divide-y">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="h-9 w-9 shrink-0 rounded object-contain bg-secondary/40" />
                  ) : (
                    <div className="h-9 w-9 shrink-0 rounded bg-secondary" />
                  )}
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</p>
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${Number(p.stock) === 0 ? "bg-sale/20 text-sale" : "bg-warning/20 text-warning"}`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {orderStats && (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Order Status Breakdown</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
              <div key={s} className="rounded-lg border bg-background p-3 text-center">
                <div className="text-2xl font-bold">{orderStats.byStatus[s] ?? 0}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{s}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Quick Actions</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink to="/admin/products" label="Add Product" />
          <QuickLink to="/admin/banners" label="Manage Banners" />
          <QuickLink to="/admin/categories" label="Categories" />
          <QuickLink to="/admin/settings" label="Site Settings" />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="rounded-lg border bg-secondary/30 px-4 py-3 text-sm font-semibold hover:bg-secondary">
      {label} →
    </Link>
  );
}
