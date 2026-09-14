import { Phone, Truck, Gift, BookOpen, CreditCard, MapPin, Info, Star, Tag, Heart, ShoppingBag, Home, Store, Package, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSiteSettings } from "@/lib/useSiteSettings";

export type TopBarLink = { label: string; url: string; icon?: string };

const ICONS: Record<string, LucideIcon> = {
  truck: Truck, gift: Gift, blog: BookOpen, book: BookOpen, card: CreditCard,
  emi: CreditCard, map: MapPin, location: MapPin, info: Info, star: Star,
  tag: Tag, heart: Heart, bag: ShoppingBag, home: Home, store: Store,
  package: Package, help: HelpCircle, phone: Phone,
};

const DEFAULTS: TopBarLink[] = [
  { icon: "truck", label: "Order Tracking", url: "#" },
  { icon: "gift", label: "Gift", url: "#" },
  { icon: "blog", label: "Blog", url: "#" },
  { icon: "emi", label: "EMI Policy", url: "#" },
  { icon: "map", label: "Store Location", url: "#" },
];

export function TopBar() {
  const { data } = useSiteSettings();
  if (data && data.show_topbar === false) return null;
  const phone = data?.topbar_phone || "+880 1700-000000";
  const raw = (data as unknown as { topbar_links?: TopBarLink[] } | null)?.topbar_links;
  const links = Array.isArray(raw) && raw.length > 0
    ? raw.filter((l) => l && l.label && l.url)
    : DEFAULTS;

  return (
    <div className="hidden border-b bg-primary text-primary-foreground md:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs">
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-neon">
          <Phone className="h-3.5 w-3.5" />
          {phone}
        </a>
        <div className="flex items-center gap-5">
          {links.map((l, i) => {
            const Icon = ICONS[(l.icon || "").toLowerCase()] ?? Info;
            return (
              <a key={`${l.label}-${i}`} href={l.url} className="inline-flex items-center gap-1.5 opacity-80 transition-opacity hover:text-neon hover:opacity-100">
                <Icon className="h-3.5 w-3.5" />
                {l.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
