import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2, Loader2, Save, Edit, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { TableControls, sortBy } from "@/components/admin/TableControls";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

const SORTS = [
  { value: "sort", label: "Sort order" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "active", label: "Active first" },
  { value: "inactive", label: "Inactive first" },
] as const;
type SortKey = typeof SORTS[number]["value"];

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

interface CatForm { name: string; slug: string; image_url: string | null; sort_order: number; is_active: boolean }
const empty: CatForm = { name: "", slug: "", image_url: null, sort_order: 0, is_active: true };

function CategoriesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<CatForm>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("sort");

  const { data: cats } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const close = () => { setOpen(false); setForm(empty); setEditingId(null); };

  const save = useMutation({
    mutationFn: async () => {
      const nextSort = editingId
        ? form.sort_order
        : Math.max(0, ...(cats ?? []).map((c) => c.sort_order ?? 0)) + 1;
      let slug = slugify(form.name) || "category";
      const { data: clash } = await supabase
        .from("categories").select("id").eq("slug", slug).maybeSingle();
      if (clash && clash.id !== editingId) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      }
      const payload = { ...form, slug, sort_order: nextSort };
      if (editingId) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Updated" : "Created");
      close();
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const filtered = useMemo(() => {
    let list = cats ?? [];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s));
    }
    switch (sort) {
      case "name_asc": return sortBy(list, (c) => c.name, "asc");
      case "name_desc": return sortBy(list, (c) => c.name, "desc");
      case "active": return sortBy(list, (c) => (c.is_active ? 0 : 1), "asc");
      case "inactive": return sortBy(list, (c) => (c.is_active ? 1 : 0), "asc");
      default: return sortBy(list, (c) => c.sort_order ?? 0, "asc");
    }
  }, [cats, q, sort]);

  const bulk = useBulkSelect(filtered);

  const bulkDel = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("categories").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted selected");
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk delete failed"),
  });

  const bulkSetActive = useMutation({
    mutationFn: async ({ ids, active }: { ids: string[]; active: boolean }) => {
      const { error } = await supabase.from("categories").update({ is_active: active }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk update failed"),
  });

  const dup = useMutation({
    mutationFn: async (c: { name: string; image_url: string | null; is_active: boolean }) => {
      const baseSlug = slugify(`${c.name}-copy`) || "category-copy";
      let slug = baseSlug;
      const { data: clash } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
      if (clash) slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      const nextSort = Math.max(0, ...(cats ?? []).map((x) => x.sort_order ?? 0)) + 1;
      const { error } = await supabase.from("categories").insert({
        name: `${c.name} (Copy)`, slug, image_url: c.image_url, is_active: c.is_active, sort_order: nextSort,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category duplicated");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Duplicate failed"),
  });

  const submit = (e: FormEvent) => { e.preventDefault(); save.mutate(); };
  const field = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary";

  const openNew = () => { setForm(empty); setEditingId(null); setOpen(true); };
  const openEdit = (c: { id: string; name: string; slug: string; image_url: string | null; sort_order: number; is_active: boolean }) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, image_url: c.image_url, sort_order: c.sort_order, is_active: c.is_active });
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">{cats?.length ?? 0} total</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <TableControls q={q} onQ={setQ} placeholder="Search categories…" sort={sort} onSort={setSort} sortOptions={SORTS} />

      <BulkActionBar
        count={bulk.count}
        onClear={bulk.clear}
        onDelete={() => confirm(`Delete ${bulk.count} categories?`) && bulkDel.mutate(bulk.ids)}
        onDeactivate={() => bulkSetActive.mutate({ ids: bulk.ids, active: false })}
        onActivate={() => bulkSetActive.mutate({ ids: bulk.ids, active: true })}
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-primary"
                  checked={bulk.allSelected}
                  ref={(el) => { if (el) el.indeterminate = bulk.someSelected; }}
                  onChange={bulk.toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-right">Sort</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c) => (
              <tr key={c.id} className={`hover:bg-secondary/30 ${bulk.isSelected(c.id) ? "bg-primary/5" : ""}`}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-primary"
                    checked={bulk.isSelected(c.id)}
                    onChange={() => bulk.toggle(c.id)}
                    aria-label={`Select ${c.name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  {c.image_url ? (
                    <img src={c.image_url} alt="" className="h-10 w-10 rounded object-contain bg-secondary/40" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-secondary" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                <td className="px-4 py-3 text-right">{c.sort_order}</td>
                <td className="px-4 py-3">
                  {c.is_active ? <span className="rounded bg-success/20 px-1.5 py-0.5 text-[10px] text-success">Active</span>
                    : <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Inactive</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)}
                    className="mr-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => dup.mutate(c)}
                    className="mr-3 inline-flex items-center gap-1 text-xs font-semibold text-info hover:underline">
                    <Copy className="h-3 w-3" /> Duplicate
                  </button>
                  <button onClick={() => confirm("Delete this category?") && del.mutate(c.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sale hover:underline">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">{q ? "No matches" : "No categories yet"}</td></tr>
            )}
          </tbody>
        </table>
      </div>


      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Image</div>
              <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="categories" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-muted-foreground">Name *</div>
                <input required placeholder="e.g. Smartphones" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={field} />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded" />
                Active
              </label>
            </div>
            <DialogFooter>
              <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={save.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingId ? "Save Changes" : "Create"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
