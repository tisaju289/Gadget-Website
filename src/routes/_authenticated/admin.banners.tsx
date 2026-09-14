import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Plus, Trash2, Loader2, Save, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: BannersPage,
});

interface BannerForm {
  title: string; subtitle: string; image_url: string | null; link_url: string;
  position: string; sort_order: number; is_active: boolean;
}
const empty: BannerForm = {
  title: "", subtitle: "", image_url: null, link_url: "",
  position: "hero", sort_order: 0, is_active: true,
};
const POSITIONS = ["hero", "mini", "promo"];

function BannersPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<BannerForm>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { data: banners } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("banners").select("*").order("position").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const close = () => { setOpen(false); setForm(empty); setEditingId(null); };

  const save = useMutation({
    mutationFn: async () => {
      if (!form.image_url) throw new Error("Please upload a banner image");
      const nextSort = editingId
        ? form.sort_order
        : Math.max(
            0,
            ...(banners ?? []).filter((b) => b.position === form.position).map((b) => b.sort_order ?? 0),
          ) + 1;
      const payload = {
        image_url: form.image_url,
        position: form.position,
        sort_order: nextSort,
        is_active: form.is_active,
        title: form.title || null,
        subtitle: form.subtitle || null,
        link_url: form.link_url || null,
      };
      if (editingId) {
        const { error } = await supabase.from("banners").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Updated" : "Created");
      close();
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["home"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const submit = (e: FormEvent) => { e.preventDefault(); save.mutate(); };
  const field = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary";

  const openNew = () => { setForm(empty); setEditingId(null); setOpen(true); };
  const openEdit = (b: { id: string; title: string | null; subtitle: string | null; image_url: string; link_url: string | null; position: string; sort_order: number; is_active: boolean }) => {
    setEditingId(b.id);
    setForm({ title: b.title ?? "", subtitle: b.subtitle ?? "", image_url: b.image_url, link_url: b.link_url ?? "", position: b.position, sort_order: b.sort_order, is_active: b.is_active });
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">hero</span> — main slider · <span className="font-semibold">mini</span> — side · <span className="font-semibold">promo</span> — flash sale
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Image</th>
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Position</th>
                <th className="px-4 py-3 text-left font-semibold">Order</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(banners ?? []).map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <img src={b.image_url} alt={b.title ?? ""} className="h-14 w-24 rounded object-cover" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{b.title || "(no title)"}</div>
                    {b.subtitle && <div className="text-xs text-muted-foreground">{b.subtitle}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase">{b.position}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.sort_order}</td>
                  <td className="px-4 py-3">
                    {b.is_active
                      ? <span className="rounded bg-success/20 px-2 py-0.5 text-[10px] font-semibold text-success">Active</span>
                      : <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold">Off</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(b)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                        <Edit className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => confirm("Delete this banner?") && del.mutate(b.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-sale hover:underline">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!banners || banners.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No banners yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Image *</div>
              <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="banners" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold text-muted-foreground">Title</div>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-muted-foreground">Subtitle</div>
                <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={field} />
              </div>
              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-muted-foreground">Link URL</div>
                <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className={field} />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-muted-foreground">Position</div>
                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={field}>
                  {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
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
