import { Phone, Home, Store, ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { cart, cartCount, useCart } from "@/lib/cart";

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.14 1.6 5.94L0 24l6.31-1.65a11.86 11.86 0 0 0 5.74 1.46h.01c6.56 0 11.89-5.33 11.89-11.9 0-3.18-1.24-6.16-3.43-8.43ZM12.06 21.8h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.38a9.84 9.84 0 0 1-1.5-5.26c0-5.45 4.43-9.88 9.89-9.88 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.9 9.89Zm5.42-7.41c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.13 4.55.72.31 1.27.5 1.71.64.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"/>
    </svg>
  );
}

export function MobileBottomNav() {
  const { data } = useSiteSettings();
  const { items } = useCart();
  const count = cartCount(items);

  if (data && data.show_mobile_bottom_nav === false) return null;

  const phone = (data as Record<string, unknown> | null | undefined)?.bottom_nav_phone as string | undefined;
  const whatsapp = (data as Record<string, unknown> | null | undefined)?.bottom_nav_whatsapp as string | undefined;

  const iconClass = "flex h-9 w-9 items-center justify-center text-foreground";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        <li>
          <a
            href={phone ? `tel:${phone.replace(/\s+/g, "")}` : "#"}
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium"
          >
            <span className={iconClass}><Phone className="h-5 w-5" /></span>
            <span>Phone</span>
          </a>
        </li>
        <li>
          <a
            href={whatsapp ? `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium"
          >
            <span className={iconClass}><WhatsappIcon className="h-5 w-5" /></span>
            <span>WhatsApp</span>
          </a>
        </li>
        <li>
          <Link to="/" className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium">
            <span className={iconClass}><Home className="h-5 w-5" /></span>
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link to="/products" className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium">
            <span className={iconClass}><Store className="h-5 w-5" /></span>
            <span>Shop</span>
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => cart.openDrawer()}
            className="flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-medium"
          >
            <span className={`${iconClass} relative`}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sale px-1 text-[9px] font-bold text-sale-foreground">
                  {count}
                </span>
              )}
            </span>
            <span>Cart</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
