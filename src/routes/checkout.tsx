import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, ShoppingBag, Truck } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cart, cartTotal, formatBDT, useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { proxyImg } from "@/lib/img";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Complete your order" },
      { name: "description", content: "Enter your shipping details and place your order with cash on delivery." },
    ],
  }),
  component: CheckoutPage,
});

type Delivery = "inside" | "outside";

function CheckoutPage() {
  const { items } = useCart();
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const s = (settings ?? {}) as Record<string, unknown>;

  const DELIVERY: Record<Delivery, { label: string; fee: number; note: string }> = {
    inside: {
      label: (s.checkout_inside_label as string) || "Inside Dhaka",
      fee: s.checkout_inside_fee != null ? Number(s.checkout_inside_fee) : 60,
      note: (s.checkout_inside_note as string) || "Delivery within 1-2 business days.",
    },
    outside: {
      label: (s.checkout_outside_label as string) || "Outside Dhaka",
      fee: s.checkout_outside_fee != null ? Number(s.checkout_outside_fee) : 120,
      note: (s.checkout_outside_note as string) || "Delivery within 2-4 business days.",
    },
  };

  const pageTitle = (s.checkout_title as string) || "Checkout";
  const codLabel = (s.checkout_cod_label as string) || "Cash on Delivery (COD)";
  const codNote = (s.checkout_cod_note as string) || "Pay when your order is delivered to your doorstep.";
  const successTitle = (s.checkout_success_title as string) || "Order placed!";
  const successMessage = (s.checkout_success_message as string) || "Thank you for shopping with us. Our team will call you shortly to confirm your order.";
  const termsText = (s.checkout_terms_text as string) || "By placing the order you agree to our terms.";
  const showNoteField = s.checkout_show_note_field !== false;


  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState<Delivery>("inside");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const subtotal = cartTotal(items);
  const shipping = DELIVERY[delivery].fee;
  const total = subtotal + shipping;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty");
    if (!name.trim()) return toast.error("Please enter your name");
    if (!/^[0-9+\-\s]{10,15}$/.test(mobile.trim())) return toast.error("Please enter a valid mobile number");
    if (address.trim().length < 10) return toast.error("Please enter a complete address");

    setPlacing(true);
    const { error } = await supabase.from("orders").insert({
      customer_name: name.trim(),
      customer_mobile: mobile.trim(),
      customer_address: address.trim(),
      delivery_option: delivery,
      delivery_fee: shipping,
      subtotal,
      total,
      payment_method: "cod",
      note: note.trim() || null,
      status: "pending",
      items: items.map((i) => ({
        id: i.id, slug: i.slug, name: i.name, brand: i.brand ?? null,
        image: i.image ?? null, price: i.price, qty: i.qty,
      })),
    });
    setPlacing(false);
    if (error) {
      toast.error("Could not place order. Please try again.");
      return;
    }
    setPlaced(true);
    cart.clear();
    toast.success("Order placed! We'll call you shortly to confirm.");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopBar />
      <Header />

      <div className="border-b bg-secondary/20">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to shopping
          </Link>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">{pageTitle}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {placed ? (
          <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">{successTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {successMessage} <strong>{mobile}</strong>
            </p>
            <button
              onClick={() => navigate({ to: "/" })}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continue shopping
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold">Your cart is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add some products before checking out.</p>
            <Link to="/" className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Browse products
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr,380px]">
            {/* Left: form */}
            <div className="space-y-6">
              <section className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="mb-4 text-base font-bold">Shipping Information</h2>
                <div className="grid gap-4">
                  <Field label="Full Name *">
                    <input
                      required maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Karim Rahman"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Mobile Number *">
                    <input
                      required type="tel" maxLength={15}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Full Address *">
                    <textarea
                      required rows={3} maxLength={500}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Flat, Road, Area, Thana, District"
                      className={`${inputCls} h-auto py-2 resize-none`}
                    />
                  </Field>
                  {showNoteField && (
                    <Field label="Order Note (optional)">
                      <textarea
                        rows={2} maxLength={300}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Anything we should know?"
                        className={`${inputCls} h-auto py-2 resize-none`}
                      />
                    </Field>
                  )}
                </div>
              </section>

              <section className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="mb-4 text-base font-bold">Delivery Option</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(DELIVERY) as Delivery[]).map((key) => {
                    const opt = DELIVERY[key];
                    const active = delivery === key;
                    return (
                      <label
                        key={key}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          active ? "border-primary bg-primary/5" : "border-input hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio" name="delivery" className="sr-only"
                          checked={active}
                          onChange={() => setDelivery(key)}
                        />
                        <div className="flex items-start gap-3">
                          <Truck className={`mt-0.5 h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-semibold">{opt.label}</span>
                              <span className="text-sm font-bold text-sale">{formatBDT(opt.fee)}</span>
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">{opt.note}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="mb-4 text-base font-bold">Payment Method</h2>
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{codLabel}</p>
                      <p className="text-[11px] text-muted-foreground">{codNote}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: summary */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="mb-4 text-base font-bold">Order Summary</h2>
                <ul className="space-y-3 border-b pb-4">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border bg-secondary/40">
                        {i.image && <img src={proxyImg(i.image, 120)} alt={i.name} loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-2 text-xs font-medium leading-snug">{i.name}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">Qty: {i.qty}</p>
                      </div>
                      <span className="text-xs font-bold text-sale">{formatBDT(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 py-4 text-sm">
                  <Row label="Subtotal" value={formatBDT(subtotal)} />
                  <Row label={`Shipping (${DELIVERY[delivery].label})`} value={formatBDT(shipping)} />
                </div>
                <div className="flex items-baseline justify-between border-t pt-4">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-extrabold text-sale">{formatBDT(total)}</span>
                </div>
                <button
                  type="submit"
                  disabled={placing}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                  {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {placing ? "Placing order..." : "Place Order"}
                </button>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">{termsText}</p>
              </div>
            </aside>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}

const inputCls = "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
