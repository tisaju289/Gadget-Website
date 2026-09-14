import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";

type Variation = { name: string; price: number | null; stock: number | null };
type Specification = { key: string; value: string };

type ProductRow = {
  id?: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  image_url: string | null;
  gallery: string[];
  price: number;
  original_price: number | null;
  label: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  stock: number;
  sku: string | null;
  warranty: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_flash_sale: boolean;
  is_new_arrival: boolean;
  variations: Variation[];
  specifications: Specification[];
};

const emptyProduct: ProductRow = {
  name: "", slug: "", brand: "", description: "", image_url: null, gallery: [],
  price: 0, original_price: null, label: null, category_id: null, subcategory_id: null,
  stock: 0, sku: null, warranty: null,
  is_active: true, is_featured: false, is_flash_sale: false, is_new_arrival: false,
  variations: [], specifications: [],
};

const LABELS = ["Hot Product", "Top Selling", "Customers Choice", "High Demand", "New Arrival"];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export function ProductForm({ initial, onDone }: { initial?: ProductRow; onDone?: () => void }) {
  const isEdit = !!initial?.id;
  const [p, setP] = useState<ProductRow>(initial ?? emptyProduct);
  const qc = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: brands } = useQuery({
    queryKey: ["admin", "brands", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategories, isLoading: subsLoading } = useQuery({
    queryKey: ["admin", "subcategories", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name, category_id, is_active, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const filteredSubs = (subcategories ?? []).filter(
    (s) => s.is_active && (!p.category_id || s.category_id === p.category_id)
  );

  const save = useMutation({
    mutationFn: async (row: ProductRow) => {
      let sort_order: number | undefined;
      if (!isEdit) {
        const { data: maxRow } = await supabase
          .from("products").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
        sort_order = (maxRow?.sort_order ?? 0) + 1;
      }

      // Ensure unique slug — append short suffix if collision
      let slug = slugify(row.name);
      if (!slug) slug = "product";
      const { data: clash } = await supabase
        .from("products").select("id").eq("slug", slug).maybeSingle();
      if (clash && clash.id !== row.id) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;
      }

      const { id: _omit, ...rest } = row;
      const payload = {
        ...rest,
        slug,
        brand: row.brand || null,
        description: row.description || null,
        original_price: row.original_price || null,
        label: row.label || null,
        category_id: row.category_id || null,
        subcategory_id: row.subcategory_id || null,
        sku: row.sku?.trim() || null,
        warranty: row.warranty?.trim() || null,
        gallery: row.gallery ?? [],
        variations: (row.variations ?? []).filter(v => v.name.trim()),
        specifications: (row.specifications ?? []).filter(s => s.key.trim()),
        ...(sort_order !== undefined ? { sort_order } : {}),
      };
      if (isEdit && row.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },

    onSuccess: () => {
      toast.success(isEdit ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["home"] });
      onDone?.();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const del = useMutation({
    mutationFn: async () => {
      if (!initial?.id) return;
      const { error } = await supabase.from("products").delete().eq("id", initial.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["home"] });
      onDone?.();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(p);
  };

  const field = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary";
  const label = "text-xs font-semibold text-muted-foreground";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[200px,1fr]">
        <div className="space-y-4">
          <div>
            <div className={label + " mb-2"}>Main Image</div>
            <ImageUploader value={p.image_url} onChange={(url) => setP({ ...p, image_url: url })} />
          </div>
          <div>
            <div className={label + " mb-2 flex items-center justify-between"}>
              <span>Gallery Images</span>
              <span className="text-[11px] font-normal">{p.gallery.length} image{p.gallery.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-3">
              {/* Gallery thumbnails */}
              {p.gallery.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.gallery.map((url, i) => (
                    <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-lg border bg-secondary/40">
                      <img src={url} alt="" className="h-full w-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => setP({ ...p, gallery: p.gallery.filter((_, j) => j !== i) })}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Add more uploader — key resets after each upload so user can add another immediately */}
              <ImageUploader
                key={`gallery-${p.gallery.length}`}
                value={null}
                onChange={(url) => url && setP({ ...p, gallery: [...p.gallery, url] })}
                folder="products/gallery"
                label="Add More Images"
              />
              <p className="text-[11px] text-muted-foreground">You can add multiple images. They show on the product details page.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className={label}>Name *</div>
              <input
                required
                value={p.name}
                onChange={(e) => setP({ ...p, name: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <div className={label}>Brand</div>
              <select
                value={p.brand ?? ""}
                onChange={(e) => setP({ ...p, brand: e.target.value || null })}
                className={field}
              >
                <option value="">— None —</option>
                {brands?.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className={label}>Category</div>
              <select
                value={p.category_id ?? ""}
                onChange={(e) => setP({ ...p, category_id: e.target.value || null, subcategory_id: null })}
                className={field}
              >
                <option value="">— None —</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className={label}>Subcategory</div>
              <select
                value={p.subcategory_id ?? ""}
                onChange={(e) => setP({ ...p, subcategory_id: e.target.value || null })}
                className={field}
                disabled={!p.category_id || subsLoading}
              >
                <option value="">
                  {!p.category_id
                    ? "— Select a category first —"
                    : subsLoading
                      ? "Loading…"
                      : filteredSubs.length === 0
                        ? "— No subcategories —"
                        : "— None —"}
                </option>
                {filteredSubs.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div className={label}>Price (৳) *</div>
              <input
                required type="number" min={0} step="0.01"
                value={p.price}
                onChange={(e) => setP({ ...p, price: Number(e.target.value) })}
                className={field}
              />
            </div>
            <div>
              <div className={label}>Original Price (৳)</div>
              <input
                type="number" min={0} step="0.01"
                value={p.original_price ?? ""}
                onChange={(e) => setP({ ...p, original_price: e.target.value ? Number(e.target.value) : null })}
                className={field}
              />
            </div>
            <div>
              <div className={label}>Stock</div>
              <input
                type="number" min={0}
                value={p.stock}
                onChange={(e) => setP({ ...p, stock: Number(e.target.value) })}
                className={field}
              />
            </div>
            <div>
              <div className={label}>SKU</div>
              <input
                value={p.sku ?? ""}
                onChange={(e) => setP({ ...p, sku: e.target.value })}
                placeholder="e.g. NX-12345"
                className={field}
              />
            </div>
            <div>
              <div className={label}>Warranty</div>
              <input
                value={p.warranty ?? ""}
                onChange={(e) => setP({ ...p, warranty: e.target.value })}
                placeholder="e.g. 1 Year / 7 Days"
                className={field}
              />
            </div>
            <div>
              <div className={label}>Label</div>
              <select
                value={p.label ?? ""}
                onChange={(e) => setP({ ...p, label: e.target.value || null })}
                className={field}
              >
                <option value="">— None —</option>
                {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className={label}>Description</div>
            <RichTextEditor
              value={p.description ?? ""}
              onChange={(html) => setP({ ...p, description: html })}
              placeholder="Write product description..."
            />
          </div>

          <div className="flex flex-wrap gap-4 rounded-lg border bg-secondary/30 p-4">
            {([
              ["is_active", "Active"],
              ["is_featured", "Featured (Best Deals)"],
              ["is_flash_sale", "Flash Sale"],
              ["is_new_arrival", "New Arrival"],
            ] as const).map(([key, lbl]) => (
              <label key={key} className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={p[key] as boolean}
                  onChange={(e) => setP({ ...p, [key]: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                {lbl}
              </label>
            ))}
          </div>

          {/* Variations */}
          <div className="rounded-lg border bg-secondary/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Variations</div>
                <div className="text-[11px] text-muted-foreground">e.g. Size: M / Color: Red — each with optional price &amp; stock override.</div>
              </div>
              <button
                type="button"
                onClick={() => setP({ ...p, variations: [...p.variations, { name: "", price: null, stock: null }] })}
                className="inline-flex items-center gap-1 rounded-md border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            {p.variations.length > 0 && (
              <div className="space-y-2">
                {p.variations.map((v, i) => (
                  <div key={i} className="grid grid-cols-[1fr,110px,90px,auto] gap-2">
                    <input
                      placeholder="Variation (e.g. Size: M)"
                      value={v.name}
                      onChange={(e) => {
                        const next = [...p.variations];
                        next[i] = { ...v, name: e.target.value };
                        setP({ ...p, variations: next });
                      }}
                      className={field}
                    />
                    <input
                      type="number" min={0} step="0.01" placeholder="Price"
                      value={v.price ?? ""}
                      onChange={(e) => {
                        const next = [...p.variations];
                        next[i] = { ...v, price: e.target.value ? Number(e.target.value) : null };
                        setP({ ...p, variations: next });
                      }}
                      className={field}
                    />
                    <input
                      type="number" min={0} placeholder="Stock"
                      value={v.stock ?? ""}
                      onChange={(e) => {
                        const next = [...p.variations];
                        next[i] = { ...v, stock: e.target.value ? Number(e.target.value) : null };
                        setP({ ...p, variations: next });
                      }}
                      className={field}
                    />
                    <button
                      type="button"
                      onClick={() => setP({ ...p, variations: p.variations.filter((_, j) => j !== i) })}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border text-sale hover:bg-sale/10"
                      aria-label="Remove variation"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="rounded-lg border bg-secondary/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Specifications</div>
                <div className="text-[11px] text-muted-foreground">Key-value spec sheet shown on the product page.</div>
              </div>
              <button
                type="button"
                onClick={() => setP({ ...p, specifications: [...p.specifications, { key: "", value: "" }] })}
                className="inline-flex items-center gap-1 rounded-md border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            {p.specifications.length > 0 && (
              <div className="space-y-2">
                {p.specifications.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr,1.5fr,auto] gap-2">
                    <input
                      placeholder="Key (e.g. Material)"
                      value={s.key}
                      onChange={(e) => {
                        const next = [...p.specifications];
                        next[i] = { ...s, key: e.target.value };
                        setP({ ...p, specifications: next });
                      }}
                      className={field}
                    />
                    <input
                      placeholder="Value (e.g. Cotton)"
                      value={s.value}
                      onChange={(e) => {
                        const next = [...p.specifications];
                        next[i] = { ...s, value: e.target.value };
                        setP({ ...p, specifications: next });
                      }}
                      className={field}
                    />
                    <button
                      type="button"
                      onClick={() => setP({ ...p, specifications: p.specifications.filter((_, j) => j !== i) })}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border text-sale hover:bg-sale/10"
                      aria-label="Remove specification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        {isEdit ? (
          <button
            type="button"
            onClick={() => confirm("Delete this product?") && del.mutate()}
            className="inline-flex items-center gap-2 rounded-lg border border-sale/40 px-4 py-2 text-sm font-semibold text-sale hover:bg-sale/10"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        ) : <span />}
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
