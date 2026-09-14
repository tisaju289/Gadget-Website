import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Eye, Trash2, Phone, MapPin, Package2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { TableControls, sortBy } from "@/components/admin/TableControls";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

type OrderItem = {
  id: string; slug: string; name: string; brand?: string | null;
  image?: string | null; price: number; qty: number;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_mobile: string;
  customer_address: string;
  delivery_option: string;
  delivery_fee: number;
  subtotal: number;
  total: number;
  payment_method: string;
  note: string | null;
  status: string;
  items: OrderItem[];
  created_at: string;
};

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-500/20 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/20 text-red-700 dark:text-red-400",
};

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "total_desc", label: "Total: High → Low" },
  { value: "total_asc", label: "Total: Low → High" },
  { value: "name_asc", label: "Customer A-Z" },
] as const;
type SortKey = typeof SORTS[number]["value"];

const fmt = (n: number) => "৳" + Math.round(n).toLocaleString("en-IN");

function AdminOrders() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [viewing, setViewing] = useState<Order | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Order[];
    },
  });

  const filtered = useMemo(() => {
    let rows = filter === "all" ? orders : orders.filter((o) => o.status === filter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter((o) =>
        o.order_number.toLowerCase().includes(s) ||
        o.customer_name.toLowerCase().includes(s) ||
        o.customer_mobile.toLowerCase().includes(s)
      );
    }
    switch (sort) {
      case "oldest": return sortBy(rows, (o) => o.created_at, "asc");
      case "total_desc": return sortBy(rows, (o) => Number(o.total), "desc");
      case "total_asc": return sortBy(rows, (o) => Number(o.total), "asc");
      case "name_asc": return sortBy(rows, (o) => o.customer_name, "asc");
      default: return sortBy(rows, (o) => o.created_at, "desc");
    }
  }, [orders, filter, q, sort]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    if (viewing?.id === id) setViewing({ ...viewing, status });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order deleted");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    if (viewing?.id === id) setViewing(null);
  };

  const bulk = useBulkSelect(filtered);
  const bulkDel = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("orders").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted selected");
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk delete failed"),
  });
  const bulkStatus = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk update failed"),
  });

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage customer orders and update fulfillment status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label={`All (${orders.length})`} />
          {STATUSES.map((s) => (
            <FilterPill
              key={s}
              active={filter === s}
              onClick={() => setFilter(s)}
              label={`${s} (${counts[s] || 0})`}
            />
          ))}
        </div>
      </div>

      <TableControls
        q={q} onQ={setQ}
        placeholder="Search order #, customer, mobile…"
        sort={sort} onSort={setSort}
        sortOptions={SORTS}
        right={
          <Select onValueChange={(v) => bulk.count > 0 && bulkStatus.mutate({ ids: bulk.ids, status: v })}>
            <SelectTrigger className="h-10 w-44" disabled={bulk.count === 0}>
              <SelectValue placeholder="Bulk: set status…" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <BulkActionBar
        count={bulk.count}
        onClear={bulk.clear}
        onDelete={() => confirm(`Delete ${bulk.count} orders?`) && bulkDel.mutate(bulk.ids)}
      />

      <div className="rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-sm text-muted-foreground">
            <Package2 className="h-10 w-10 opacity-40" />
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-secondary/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input type="checkbox" className="h-4 w-4 cursor-pointer accent-primary"
                      checked={bulk.allSelected}
                      ref={(el) => { if (el) el.indeterminate = bulk.someSelected; }}
                      onChange={bulk.toggleAll} aria-label="Select all" />
                  </th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className={`border-b last:border-0 hover:bg-secondary/20 ${bulk.isSelected(o.id) ? "bg-primary/5" : ""}`}>
                    <td className="px-3 py-3">
                      <input type="checkbox" className="h-4 w-4 cursor-pointer accent-primary"
                        checked={bulk.isSelected(o.id)} onChange={() => bulk.toggle(o.id)} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.customer_mobile}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{o.items.reduce((s, i) => s + i.qty, 0)} pcs</td>
                    <td className="px-4 py-3 font-bold text-sale">{fmt(o.total)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className={`h-8 w-32 text-xs font-semibold ${STATUS_STYLE[o.status] || ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setViewing(o)}
                          className="rounded-md p-2 hover:bg-secondary"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(o.id)}
                          className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-mono">
                  {viewing.order_number}
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[viewing.status]}`}>
                    {viewing.status}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Placed on {new Date(viewing.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <section className="rounded-lg border bg-secondary/20 p-4">
                  <h3 className="mb-2 text-xs font-bold uppercase text-muted-foreground">Customer</h3>
                  <p className="font-semibold">{viewing.customer_name}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${viewing.customer_mobile}`} className="text-primary hover:underline">{viewing.customer_mobile}</a>
                  </p>
                  <p className="mt-1 flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{viewing.customer_address}</span>
                  </p>
                  {viewing.note && (
                    <p className="mt-2 rounded bg-background p-2 text-xs italic">Note: {viewing.note}</p>
                  )}
                </section>

                <section className="rounded-lg border p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Items</h3>
                  <ul className="space-y-2">
                    {viewing.items.map((i, idx) => (
                      <li key={idx} className="flex items-center gap-3 border-b pb-2 last:border-0 last:pb-0">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded border bg-secondary/40">
                          {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-contain p-1" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium">{i.name}</p>
                          <p className="text-xs text-muted-foreground">{fmt(i.price)} × {i.qty}</p>
                        </div>
                        <span className="text-sm font-bold text-sale">{fmt(i.price * i.qty)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-lg border p-4 text-sm">
                  <Row label="Subtotal" value={fmt(viewing.subtotal)} />
                  <Row label={`Delivery (${viewing.delivery_option === "inside" ? "Inside Dhaka" : "Outside Dhaka"})`} value={fmt(viewing.delivery_fee)} />
                  <Row label="Payment" value={viewing.payment_method.toUpperCase()} />
                  <div className="mt-2 flex items-baseline justify-between border-t pt-2">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-extrabold text-sale">{fmt(viewing.total)}</span>
                  </div>
                </section>

                <div className="flex items-center justify-between gap-2">
                  <Select value={viewing.status} onValueChange={(v) => updateStatus(viewing.id, v)}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => remove(viewing.id)}
                    className="inline-flex items-center gap-2 rounded-md border border-destructive/40 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Order
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
        active ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/70"
      }`}
    >
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
