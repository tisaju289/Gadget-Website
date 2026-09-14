import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductForm } from "@/components/admin/ProductForm";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { TableControls, sortBy } from "@/components/admin/TableControls";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  component: ProductsListPage,
});

const fmt = (n: number) => "৳" + n.toLocaleString("en-IN");

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "stock_asc", label: "Stock: Low → High" },
  { value: "stock_desc", label: "Stock: High → Low" },
] as const;
type SortKey = typeof SORTS[number]["value"];

function ProductsListPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const dup = useMutation({
    mutationFn: async (id: string) => {
      const { data: src, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = src as Record<string, unknown> & { id: string; created_at: string; updated_at: string };
      const baseSlug = `${(rest.slug as string) || "product"}-copy`;
      let slug = baseSlug;
      const { data: clash } = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
      if (clash) slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      const payload = { ...rest, name: `${rest.name} (Copy)`, slug, is_active: false };
      const { error: insErr } = await supabase.from("products").insert(payload as never);
      if (insErr) throw insErr;
    },
    onSuccess: () => {
      toast.success("Product duplicated");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Duplicate failed"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, image_url, price, original_price, stock, is_active, is_featured, is_flash_sale, is_new_arrival, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: editing } = useQuery({
    queryKey: ["admin", "product", editId],
    enabled: !!editId,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", editId!).single();
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(s) ||
        (p.brand ?? "").toLowerCase().includes(s)
      );
    }
    switch (sort) {
      case "oldest": return sortBy(list, (p) => p.created_at, "asc");
      case "name_asc": return sortBy(list, (p) => p.name, "asc");
      case "name_desc": return sortBy(list, (p) => p.name, "desc");
      case "price_desc": return sortBy(list, (p) => Number(p.price), "desc");
      case "price_asc": return sortBy(list, (p) => Number(p.price), "asc");
      case "stock_asc": return sortBy(list, (p) => Number(p.stock ?? 0), "asc");
      case "stock_desc": return sortBy(list, (p) => Number(p.stock ?? 0), "desc");
      default: return sortBy(list, (p) => p.created_at, "desc");
    }
  }, [data, q, sort]);

  const bulk = useBulkSelect(filtered);

  const bulkDel = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted selected");
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk delete failed"),
  });

  const bulkPatch = useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: Partial<{ is_active: boolean; is_featured: boolean; is_flash_sale: boolean; is_new_arrival: boolean }> }) => {
      const { error } = await supabase.from("products").update(patch).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk update failed"),
  });

  const openNew = () => { setEditId(null); setOpen(true); };
  const openEdit = (id: string) => { setEditId(id); setOpen(true); };
  const close = () => { setOpen(false); setEditId(null); };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{data?.length ?? 0} total</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <TableControls
        q={q} onQ={setQ}
        placeholder="Search by name or brand…"
        sort={sort} onSort={setSort}
        sortOptions={SORTS}
      />

      <BulkActionBar
        count={bulk.count}
        onClear={bulk.clear}
        onDelete={() => confirm(`Delete ${bulk.count} products?`) && bulkDel.mutate(bulk.ids)}
        onActivate={() => bulkPatch.mutate({ ids: bulk.ids, patch: { is_active: true } })}
        onDeactivate={() => bulkPatch.mutate({ ids: bulk.ids, patch: { is_active: false } })}
      />
      {bulk.count > 0 && (
        <div className="-mt-1 flex flex-wrap gap-2">
          <BulkFlagBtn label="★ Feature" onClick={() => bulkPatch.mutate({ ids: bulk.ids, patch: { is_featured: true } })} />
          <BulkFlagBtn label="Unfeature" onClick={() => bulkPatch.mutate({ ids: bulk.ids, patch: { is_featured: false } })} />
          <BulkFlagBtn label="⚡ Flash sale" onClick={() => bulkPatch.mutate({ ids: bulk.ids, patch: { is_flash_sale: true } })} />
          <BulkFlagBtn label="Clear flash" onClick={() => bulkPatch.mutate({ ids: bulk.ids, patch: { is_flash_sale: false } })} />
          <BulkFlagBtn label="✨ New arrival" onClick={() => bulkPatch.mutate({ ids: bulk.ids, patch: { is_new_arrival: true } })} />
          <BulkFlagBtn label="Clear new" onClick={() => bulkPatch.mutate({ ids: bulk.ids, patch: { is_new_arrival: false } })} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {q ? "No products match your search." : (
              <>No products yet. <button onClick={openNew} className="text-primary hover:underline">Add the first one →</button></>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input type="checkbox" className="h-4 w-4 cursor-pointer accent-primary"
                      checked={bulk.allSelected}
                      ref={(el) => { if (el) el.indeterminate = bulk.someSelected; }}
                      onChange={bulk.toggleAll} aria-label="Select all" />
                  </th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Brand</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-left">Flags</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p) => (
                  <tr key={p.id} className={`hover:bg-secondary/30 ${bulk.isSelected(p.id) ? "bg-primary/5" : ""}`}>
                    <td className="px-3 py-3">
                      <input type="checkbox" className="h-4 w-4 cursor-pointer accent-primary"
                        checked={bulk.isSelected(p.id)} onChange={() => bulk.toggle(p.id)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="h-10 w-10 rounded object-contain bg-secondary/40" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-secondary" />
                        )}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.brand}</td>
                    <td className="px-4 py-3 text-right font-semibold text-sale">{fmt(Number(p.price))}</td>
                    <td className={`px-4 py-3 text-right ${Number(p.stock) <= 5 ? "text-sale font-semibold" : ""}`}>{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {!p.is_active && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Inactive</span>}
                        {p.is_featured && <span className="rounded bg-info/20 px-1.5 py-0.5 text-[10px] text-info">Featured</span>}
                        {p.is_flash_sale && <span className="rounded bg-sale/20 px-1.5 py-0.5 text-[10px] text-sale">Flash</span>}
                        {p.is_new_arrival && <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">New</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => openEdit(p.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <Edit className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => dup.mutate(p.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-info hover:underline"
                        >
                          <Copy className="h-3 w-3" /> Duplicate
                        </button>
                        <button
                          onClick={() => confirm("Delete this product?") && del.mutate(p.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-sale hover:underline"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
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

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          {editId && !editing ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <ProductForm
              onDone={close}
              initial={
                editing
                  ? {
                      id: editing.id,
                      name: editing.name,
                      slug: editing.slug,
                      brand: editing.brand,
                      description: editing.description,
                      image_url: editing.image_url,
                      gallery: (editing as { gallery?: string[] | null }).gallery ?? [],
                      price: Number(editing.price),
                      original_price: editing.original_price ? Number(editing.original_price) : null,
                      label: editing.label,
                      category_id: editing.category_id,
                      subcategory_id: (editing as { subcategory_id?: string | null }).subcategory_id ?? null,
                      stock: editing.stock,
                      sku: (editing as { sku?: string | null }).sku ?? null,
                      warranty: (editing as { warranty?: string | null }).warranty ?? null,
                      is_active: editing.is_active,
                      is_featured: editing.is_featured,
                      is_flash_sale: editing.is_flash_sale,
                      is_new_arrival: editing.is_new_arrival,
                      variations: ((editing as { variations?: unknown }).variations as { name: string; price: number | null; stock: number | null }[] | null) ?? [],
                      specifications: ((editing as { specifications?: unknown }).specifications as { key: string; value: string }[] | null) ?? [],
                    }
                  : undefined
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BulkFlagBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
    >
      {label}
    </button>
  );
}
