import { Link } from "@tanstack/react-router";
import { Flame, Sparkles, ThumbsUp, ShoppingBag, Heart, Package } from "lucide-react";
import { formatBDT, discountPct, type Product } from "@/data/products";
import { proxyImg } from "@/lib/img";

const labelStyles: Record<string, { icon: typeof Flame; cls: string }> = {
  "Hot Product": { icon: Flame, cls: "bg-sale text-sale-foreground" },
  "Top Selling": { icon: ShoppingBag, cls: "bg-primary text-primary-foreground" },
  "Customers Choice": { icon: Heart, cls: "bg-warning text-warning-foreground" },
  "High Demand": { icon: ThumbsUp, cls: "bg-info text-info-foreground" },
  "New Arrival": { icon: Sparkles, cls: "bg-success text-success-foreground" },
};

export function ProductCard({ product }: { product: Product }) {
  const pct = discountPct(product);
  const label = product.label ? labelStyles[product.label] : undefined;
  const LabelIcon = label?.icon;

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        {pct > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-success-foreground shadow-sm">
            -{pct}%
          </span>
        )}
        {label && LabelIcon && (
          <span className={`absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${label.cls}`}>
            <LabelIcon className="h-3 w-3" />
            {product.label}
          </span>
        )}
        {product.image ? (
          <img
            src={proxyImg(product.image, 500)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground">
          {product.name}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-sale">{formatBDT(product.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{formatBDT(product.originalPrice)}</span>
        </div>

      </div>
    </Link>
  );
}
