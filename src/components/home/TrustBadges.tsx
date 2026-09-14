import { ShieldCheck, Truck, CreditCard, RefreshCw } from "lucide-react";

const badges = [
  { icon: ShieldCheck, title: "100% Genuine", desc: "All products are authentic" },
  { icon: Truck, title: "Super Fast Delivery", desc: "Same day in Dhaka" },
  { icon: CreditCard, title: "36 Months EMI", desc: "0% interest installment" },
  { icon: RefreshCw, title: "2 Years Replacement", desc: "Worry-free warranty" },
];

export function TrustBadges() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 shadow-[var(--shadow-card)] md:grid-cols-4 md:gap-6 md:p-6">
        {badges.map(b => (
          <div key={b.title} className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sale/10 text-sale">
              <b.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{b.title}</p>
              <p className="truncate text-xs text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
