import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2, Loader2, Save, Edit, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useBulkSelect } from "@/lib/useBulkSelect";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { TableControls, sortBy } from "@/components/admin/TableControls";

export const Route = createFileRoute("/_authenticated/admin/subcategories")({
  component: SubcategoriesPage,
});

const SORTS = [
  { value: "sort", label: "Sort order" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "cat_asc", label: "Category A-Z" },
  { value: "active", label: "Active first" },
] as const;
type SortKey = typeof SORTS[number]["value"];

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

interface SubForm { name: string; category_id: string; is_active: boolean }
const empty: SubForm = { name: "", category_id: "", is_active: true };

function SubcategoriesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<SubForm>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("sort");
  const [catFilter, setCatFilter] = useState<string>("all");

  const { data: cats } = useQuery({
    queryKey: ["admin", "categories", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: subs } = useQuery({
    queryKey: ["admin", "subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name, slug, sort_order, is_active, category_id, categories(name)")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const close = () => { setOpen(false); setForm(empty); setEditingId(null); };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.category_id) throw new Error("Select a category");
      const sameCat = (subs ?? []).filter((s) => s.category_id === form.category_id);
      const nextSort = editingId
        ? (subs?.find((s) => s.id === editingId)?.sort_order ?? 0)
        : Math.max(0, ...sameCat.map((s) => s.sort_order ?? 0)) + 1;
      let slug = slugify(form.name) || "sub";
      // Unique per (category_id, slug)
      const { data: clash } = await supabase
        .from("subcategories").select("id").eq("category_id", form.category_id).eq("slug", slug).maybeSingle();
      if (clash && clash.id !== editingId) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      }
      const payload = {
        name: form.name,
        slug,
        category_id: form.category_id,
        is_active: form.is_active,
        sort_order: nextSort,
      };
      if (editingId) {
        const { error } = await supabase.from("subcategories").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subcategories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Updated" : "Created");
      close();
      qc.invalidateQueries({ queryKey: ["admin", "subcategories"] });
      qc.invalidateQueries({ queryKey: ["megamenu"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subcategories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "subcategories"] });
      qc.invalidateQueries({ queryKey: ["megamenu"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const filtered = useMemo(() => {
    let list = subs ?? [];
    if (catFilter !== "all") list = list.filter((s) => s.category_id === catFilter);
    if (q.trim()) {
      const ss = q.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(ss) || s.slug.toLowerCase().includes(ss) || (s.categories?.name ?? "").toLowerCase().includes(ss));
    }
    switch (sort) {
      case "name_asc": return sortBy(list, (s) => s.name, "asc");
      case "name_desc": return sortBy(list, (s) => s.name, "desc");
      case "cat_asc": return sortBy(list, (s) => s.categories?.name ?? "", "asc");
      case "active": return sortBy(list, (s) => (s.is_active ? 0 : 1), "asc");
      default: return sortBy(list, (s) => s.sort_order ?? 0, "asc");
    }
  }, [subs, q, sort, catFilter]);

  const bulk = useBulkSelect(filtered);
  const bulkDel = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("subcategories").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted selected");
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin", "subcategories"] });
      qc.invalidateQueries({ queryKey: ["megamenu"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk delete failed"),
  });
  const bulkSetActive = useMutation({
    mutationFn: async ({ ids, active }: { ids: string[]; active: boolean }) => {
      const { error } = await supabase.from("subcategories").update({ is_active: active }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      bulk.clear();
      qc.invalidateQueries({ queryKey: ["admin", "subcategories"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Bulk update failed"),
  });

  const dup = useMutation({
    mutationFn: async (s: { name: string; category_id: string; is_active: boolean }) => {
      const baseSlug = slugify(`${s.name}-copy`) || "sub-copy";
      let slug = baseSlug;
      const { data: clash } = await supabase.from("subcategories").select("id").eq("category_id", s.category_id).eq("slug", slug).maybeSingle();
      if (clash) slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      const sameCat = (subs ?? []).filter((x) => x.category_id === s.category_id);
      const nextSort = Math.max(0, ...sameCat.map((x) => x.sort_order ?? 0)) + 1;
      const { error } = await supabase.from("subcategories").insert({
        name: `${s.name} (Copy)`, slug, category_id: s.category_id, is_active: s.is_active, sort_order: nextSort,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Subcategory duplicated");
      qc.invalidateQueries({ queryKey: ["admin", "subcategories"] });
      qc.invalidateQueries({ queryKey: ["megamenu"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Duplicate failed"),
  });

  const submit = (e: FormEvent) => { e.preventDefault(); save.mutate(); };
  const field = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary";

  const openNew = () => { setForm(empty); setEditingId(null); setOpen(true); };
  const openEdit = (s: { id: string; name: string; category_id: string; is_active: boolean }) => {
    setEditingId(s.id);
    setForm({ name: s.name, category_id: s.category_id, is_active: s.is_active });
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Subcategories</h1>
          <p className="text-sm text-muted-foreground">{subs?.length ?? 0} total</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Subcategory
        </button>
      </div>

      <TableControls
        q={q} onQ={setQ} placeholder="Search subcategories…"
        sort={sort} onSort={setSort} sortOptions={SORTS}
        right={
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary">
            <option value="all">All categories</option>
            {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        }
      />

      <BulkActionBar
        count={bulk.count}
        onClear={bulk.clear}
        onDelete={() => confirm(`Delete ${bulk.count} subcategories?`) && bulkDel.mutate(bulk.ids)}
        onDeactivate={() => bulkSetActive.mutate({ ids: bulk.ids, active: false })}
        onActivate={() => bulkSetActive.mutate({ ids: bulk.ids, active: true })}
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-3">
                <input type="checkbox" className="h-4 w-4 cursor-pointer accent-primary"
                  checked={bulk.allSelected}
                  ref={(el) => { if (el) el.indeterminate = bulk.someSelected; }}
                  onChange={bulk.toggleAll} aria-label="Select all" />
              </th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-right">Sort</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((s) => (
              <tr key={s.id} className={`hover:bg-secondary/30 ${bulk.isSelected(s.id) ? "bg-primary/5" : ""}`}>
                <td className="px-3 py-3">
                  <input type="checkbox" className="h-4 w-4 cursor-pointer accent-primary"
                    checked={bulk.isSelected(s.id)} onChange={() => bulk.toggle(s.id)} />
                </td>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.categories?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.slug}</td>
                <td className="px-4 py-3 text-right">{s.sort_order}</td>
                <td className="px-4 py-3">
                  {s.is_active ? <span className="rounded bg-success/20 px-1.5 py-0.5 text-[10px] text-success">Active</span>
                    : <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Inactive</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-3">
                    <button onClick={() => openEdit(s)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      <Edit className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => dup.mutate(s)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-info hover:underline">
                      <Copy className="h-3 w-3" /> Duplicate
                    </button>
                    <button onClick={() => confirm("Delete this subcategory?") && del.mutate(s.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sale hover:underline">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">{q || catFilter !== "all" ? "No matches" : "No subcategories yet"}</td></tr>
            )}
          </tbody>
        </table>
      </div>


      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Category *</div>
              <select required value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={field}>
                <option value="">— Select category —</option>
                {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Name *</div>
              <input required placeholder="e.g. iPhone" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded" />
              Active
            </label>
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
