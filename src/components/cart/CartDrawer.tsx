import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cart, cartTotal, formatBDT, useCart } from "@/lib/cart";
import { proxyImg } from "@/lib/img";

export function CartDrawer() {
  const { items, open } = useCart();
  const subtotal = cartTotal(items);

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? cart.openDrawer() : cart.closeDrawer())}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="rounded-full bg-secondary p-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Your cart is empty</p>
            <p className="text-xs text-muted-foreground">Add products to get started.</p>
            <button
              onClick={() => cart.closeDrawer()}
              className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((i) => (
                  <li key={i.id} className="flex gap-3 rounded-lg border bg-card p-3">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary/40">
                      {i.image ? (
                        <img src={proxyImg(i.image, 160)} alt={i.name} loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />
                      ) : (
                        <div className="h-full w-full" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug">{i.name}</p>
                        <button
                          onClick={() => cart.remove(i.id)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-neon"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {i.brand && <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{i.brand}</p>}
                      <div className="mt-1 flex items-center justify-between">
                        <div className="inline-flex items-center overflow-hidden rounded-md border">
                          <button
                            onClick={() => cart.setQty(i.id, i.qty - 1)}
                            className="px-2 py-1 hover:bg-secondary"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold">{i.qty}</span>
                          <button
                            onClick={() => cart.setQty(i.id, i.qty + 1)}
                            className="px-2 py-1 hover:bg-secondary"
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-sale">{formatBDT(i.price * i.qty)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t bg-secondary/30 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold text-foreground">{formatBDT(subtotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Delivery charge added at checkout.</p>
              <Link
                to="/checkout"
                onClick={() => cart.closeDrawer()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
              >
                Checkout
              </Link>
              <button
                onClick={() => cart.closeDrawer()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2 text-xs font-semibold hover:bg-secondary"
              >
                <X className="h-3.5 w-3.5" />
                Continue shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
