import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { proxyImg } from "@/lib/img";
import {
  ChevronRight,
  Package,
  Check,
  Minus,
  Plus,
  Facebook,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cart } from "@/lib/cart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function formatBDT(n: number) {
  return `${Number(n).toLocaleString("en-BD")}৳`;
}

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [tab, setTab] = useState<"description" | "reviews">("description");
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (product) {
      const vars = ((product as { variations?: unknown }).variations as
        | { name: string; price: number | null; stock: number | null }[]
        | null) ?? [];
      const valid = vars.filter((v) => v && v.name?.trim());
      if (valid.length > 0) {
        setSelectedVariation(0);
      } else {
        setSelectedVariation(null);
      }
    }
  }, [product?.id]);

  const categoryId = product?.category_id;
  const { data: category } = useQuery({
    queryKey: ["product-category", categoryId],
    enabled: !!categoryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("id", categoryId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const subcategoryId = (product as any)?.subcategory_id;
  const { data: subcategory } = useQuery({
    queryKey: ["product-subcategory", subcategoryId],
    enabled: !!subcategoryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name, slug")
        .eq("id", subcategoryId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const relatedCategoryId = product?.category_id;
  const productId = product?.id;
  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", relatedCategoryId, productId],
    enabled: !!relatedCategoryId && !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, brand, image_url, price, original_price, label, stock")
        .eq("category_id", relatedCategoryId!)
        .eq("is_active", true)
        .neq("id", productId!)
        .order("sort_order")
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const pct =
    product?.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100
        )
      : 0;




  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <TopBar />
        <Header />
        <MegaMenu />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-xl bg-secondary/40" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-secondary/40" />
              <div className="h-6 w-1/2 animate-pulse rounded bg-secondary/40" />
              <div className="h-32 animate-pulse rounded bg-secondary/40" />
            </div>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <TopBar />
        <Header />
        <MegaMenu />
        <main className="mx-auto max-w-7xl px-4 py-16 text-center">
          <Package className="mx-auto h-16 w-16 text-muted-foreground/40" />
          <h1 className="mt-4 text-xl font-bold">Product Not Found</h1>
          <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Continue Shopping
          </Link>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const images = [product.image_url, ...((product.gallery as string[] | null) ?? [])].filter(
    (u): u is string => !!u
  );
  const current = activeImage ?? images[0] ?? null;
  const related = relatedProducts ?? [];

  const variations = (((product as { variations?: unknown }).variations as
    | { name: string; price: number | null; stock: number | null }[]
    | null) ?? []).filter((v) => v && v.name?.trim());
  const hasVariations = variations.length > 0;
  const activeVar = selectedVariation !== null ? variations[selectedVariation] : null;
  const effectivePrice = activeVar?.price ?? Number(product.price);
  const effectiveStock = activeVar?.stock ?? product.stock ?? 0;
  const sku = (product as { sku?: string | null }).sku ?? String(product.id).slice(0, 8).toUpperCase();
  const warranty = (product as { warranty?: string | null }).warranty ?? null;

  const addToCart = () => {
    const suffix = activeVar ? ` — ${activeVar.name}` : "";
    cart.add(
      {
        id: String(product.id) + (activeVar ? `::${activeVar.name}` : ""),
        slug: product.slug,
        name: product.name + suffix,
        brand: product.brand,
        image: product.image_url ?? current,
        price: effectivePrice,
      },
      qty,
    );
  };

  const buyNow = () => {
    addToCart();
    navigate({ to: "/checkout" });
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-secondary/40">
      <TopBar />
      <Header />
      <MegaMenu />

      <main className="mx-auto max-w-7xl px-3 py-4 md:py-6">
        {/* Breadcrumb */}
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          {category && (
            <>
              <Link to="/category/$slug" params={{ slug: category.slug }} className="hover:text-foreground">
                {category.name}
              </Link>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          {subcategory && (
            <>
              <span className="hover:text-foreground">{subcategory.name}</span>
              <ChevronRight className="h-3 w-3" />
            </>
          )}
          <span className="font-medium text-foreground line-clamp-1">{product.name}</span>
        </nav>

        {/* Main product card */}
        <div className="rounded-lg border bg-card p-4 md:p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Image gallery */}
            <div className="flex gap-3">
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex flex-col gap-2">
                  {images.slice(0, 5).map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImage(url)}
                      className={`h-16 w-16 overflow-hidden rounded border bg-white transition-all ${
                        current === url ? "border-sale ring-1 ring-sale" : "hover:border-primary/50"
                      }`}
                    >
                      <img src={proxyImg(url, 160)} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="relative flex-1 overflow-hidden rounded-lg border bg-white">
                {pct > 0 && (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-white">
                    -{pct}%
                  </span>
                )}
                {current ? (
                  <img src={proxyImg(current, 900)} alt={product.name} decoding="async" className="mx-auto h-full max-h-[420px] w-full object-contain p-6" />
                ) : (
                  <div className="flex aspect-square items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              {product.brand && (
                <div className="mb-3 inline-flex w-fit items-center rounded border px-3 py-1.5">
                  <span className="text-base font-bold lowercase tracking-tight">{product.brand}.</span>
                </div>
              )}

              <h1 className="text-lg font-bold leading-snug md:text-xl">{product.name}</h1>

              <div className="mt-3 flex items-baseline gap-2">
                {product.original_price && product.original_price > effectivePrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatBDT(product.original_price)}
                  </span>
                )}
                <span className="text-2xl font-extrabold text-sale">{formatBDT(effectivePrice)}</span>
              </div>

              {/* Stock */}
              <div className="mt-3">
                {effectiveStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    <Check className="h-3.5 w-3.5" />
                    {effectiveStock} in stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Out of stock
                  </span>
                )}
              </div>

              {/* Variations */}
              {hasVariations && (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-medium">
                    Variant: <span className="text-muted-foreground">{activeVar ? activeVar.name : "Select an option"}</span>
                  </div>
                  <RadioGroup
                    value={selectedVariation !== null ? String(selectedVariation) : ""}
                    onValueChange={(val) => { setSelectedVariation(Number(val)); setQty(1); }}
                    className="flex flex-wrap gap-3"
                  >
                    {variations.map((v, i) => {
                      const out = (v.stock ?? product.stock ?? 0) <= 0;
                      return (
                        <label
                          key={i}
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition-all ${
                            selectedVariation === i
                              ? "border-sale bg-sale/10 text-sale"
                              : "border-input bg-background hover:border-neon/50"
                          } ${out ? "cursor-not-allowed opacity-50 line-through" : ""}`}
                        >
                          <RadioGroupItem
                            value={String(i)}
                            disabled={out}
                            className="h-4 w-4"
                          />
                          <span>
                            {v.name}
                            {v.price != null && v.price !== Number(product.price) && (
                              <span className="ml-1 text-[10px] opacity-70">({formatBDT(v.price)})</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}

              {/* Warranty */}
              {warranty && (
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="font-medium">Warranty:</span>
                  <span className="rounded-full border px-3 py-0.5 text-xs">{warranty}</span>
                </div>
              )}

              {/* Qty + Actions */}
              <div className="mt-5 flex flex-wrap items-stretch gap-2">
                <div className="inline-flex items-center rounded border bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 transition-colors hover:bg-secondary"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(effectiveStock || 99, q + 1))}
                    className="px-3 py-2 transition-colors hover:bg-secondary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  disabled={effectiveStock <= 0 || (hasVariations && !activeVar)}
                  onClick={addToCart}
                  className="flex-1 rounded bg-foreground px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-background transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {hasVariations && !activeVar ? "Select a variant" : "Add to Cart"}
                </button>

                <button
                  disabled={effectiveStock <= 0 || (hasVariations && !activeVar)}
                  onClick={buyNow}
                  className="flex-1 rounded bg-sale px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-sale-foreground transition-all hover:opacity-90 disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>

              {/* SKU + Categories */}
              <div className="mt-5 space-y-1.5 border-t pt-4 text-sm">
                <div>
                  <span className="font-semibold">SKU:</span>{" "}
                  <span className="text-muted-foreground">{sku}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-semibold">Categories:</span>
                  {category && (
                    <Link to="/category/$slug" params={{ slug: category.slug }} className="text-sale hover:underline">
                      {category.name}
                    </Link>
                  )}
                  {subcategory && (
                    <>
                      <span className="text-muted-foreground">,</span>
                      <span className="text-sale">{subcategory.name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Share */}
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="font-semibold">Share:</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success text-white hover:opacity-90"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(product.name + " " + shareUrl)}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success text-white hover:opacity-90"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(shareUrl)}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success text-white hover:opacity-90"
                >
                  <Mail className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className="mt-4 rounded-lg border bg-card">
          <div className="flex border-b">
            <button
              onClick={() => setTab("description")}
              className={`px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                tab === "description"
                  ? "border-b-2 border-sale bg-sale/5 text-sale"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setTab("reviews")}
              className={`px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                tab === "reviews"
                  ? "border-b-2 border-sale bg-sale/5 text-sale"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reviews
            </button>
          </div>
          <div className="p-5 md:p-6">
            {tab === "description" ? (
              <div className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground/90 dark:prose-invert">
                {product.description ? (
                  /<[a-z][\s\S]*>/i.test(product.description) ? (
                    <div className="tiptap" dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <div className="whitespace-pre-wrap">{product.description}</div>
                  )
                ) : (
                  <p className="text-muted-foreground">No description available.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-6 rounded-lg border bg-card p-4 md:p-5">
            <div className="mb-4">
              <span className="inline-block rounded-full bg-sale px-4 py-1.5 text-sm font-bold text-sale-foreground">
                Related Products
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {related.map((p) => {
                const rpct =
                  p.original_price && p.original_price > p.price
                    ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
                    : 0;
                const rOut = (p.stock ?? 0) <= 0;
                return (
                  <Link
                    key={p.id}
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="group flex h-full flex-col overflow-hidden rounded border bg-card transition-all hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-white">
                      {rpct > 0 && (
                        <span className="absolute left-2 top-2 z-10 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold text-white">
                          -{rpct}%
                        </span>
                      )}
                      {rOut && (
                        <span className="absolute right-2 top-2 z-10 rounded bg-sale px-1.5 py-0.5 text-[9px] font-bold uppercase text-sale-foreground">
                          Sold Out
                        </span>
                      )}
                      {p.image_url ? (
                        <img
                          src={proxyImg(p.image_url, 400)}
                          alt={p.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-2.5">
                      <h3 className="line-clamp-2 min-h-[2.25rem] text-xs font-medium leading-snug">
                        {p.name}
                      </h3>
                      <div className="mt-auto flex items-baseline gap-1.5">
                        {p.original_price && p.original_price > p.price && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            {formatBDT(p.original_price)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-sale">{formatBDT(p.price)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
