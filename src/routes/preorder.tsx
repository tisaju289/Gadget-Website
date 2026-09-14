import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Zap, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export const Route = createFileRoute("/preorder")({
  head: () => ({
    meta: [
      { title: "Pre-Order — Request Your Product" },
      { name: "description", content: "Request a pre-order for any product not currently available in our store." },
      { property: "og:title", content: "Pre-Order — Request Your Product" },
      { property: "og:description", content: "Request a pre-order for any product not currently available in our store." },
    ],
  }),
  component: PreorderPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Name is too short").max(100),
  customer_mobile: z.string().trim().min(7, "Invalid mobile").max(20),
  customer_address: z.string().trim().max(500).optional().or(z.literal("")),
  product_name: z.string().trim().min(2, "Product name required").max(300),
  product_link: z.string().trim().url("Must be a valid URL").max(1000).optional().or(z.literal("")),
  product_image: z.string().trim().url().max(1000).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1).max(1000),
  budget: z.coerce.number().min(0).max(100000000).optional().or(z.literal("")),
  advance_paid: z.coerce.number().min(0).max(100000000).optional().or(z.literal("")),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
});

function PreorderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: "",
    customer_mobile: "",
    customer_address: "",
    product_name: "",
    product_link: "",
    product_image: "",
    quantity: "1",
    budget: "",
    advance_paid: "",
    note: "",
  });

  const upd = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please check the form");
      return;
    }
    setLoading(true);
    const d = parsed.data;
    const { data, error } = await supabase
      .from("preorders")
      .insert({
        customer_name: d.customer_name,
        customer_mobile: d.customer_mobile,
        customer_address: d.customer_address || null,
        product_name: d.product_name,
        product_link: d.product_link || null,
        product_image: d.product_image || null,
        quantity: d.quantity,
        budget: d.budget === "" || d.budget === undefined ? null : Number(d.budget),
        advance_paid: d.advance_paid === "" || d.advance_paid === undefined ? 0 : Number(d.advance_paid),
        note: d.note || null,
      })
      .select("preorder_number")
      .single();
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(data?.preorder_number ?? "");
    toast.success("Pre-order request submitted");
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <MegaMenu />
        <main className="mx-auto max-w-xl px-4 py-16">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
            <h1 className="mt-4 text-2xl font-extrabold">Pre-Order Submitted!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We've received your request. Our team will contact you shortly to confirm pricing & delivery.
            </p>
            <p className="mt-4 inline-block rounded-full bg-secondary px-4 py-2 font-mono text-sm font-bold">
              {done}
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => navigate({ to: "/" })}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Back to Home
              </button>
              <button
                onClick={() => { setDone(null); setForm({ ...form, product_name: "", product_link: "", product_image: "", note: "" }); }}
                className="rounded-md border px-4 py-2 text-sm font-semibold"
              >
                New Pre-Order
              </button>
            </div>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <MegaMenu />
      <main className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sale/15 text-sale">
              <Zap className="h-6 w-6 fill-sale" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold">Pre-Order Request</h1>
              <p className="text-sm text-muted-foreground">Can't find your product? Tell us what you need.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Section title="Your Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name *" value={form.customer_name} onChange={(v) => upd("customer_name", v)} />
                <Field label="Mobile *" value={form.customer_mobile} onChange={(v) => upd("customer_mobile", v)} placeholder="01XXXXXXXXX" />
              </div>
              <Field label="Address" value={form.customer_address} onChange={(v) => upd("customer_address", v)} />
            </Section>

            <Section title="Product Details">
              <Field label="Product Name *" value={form.product_name} onChange={(v) => upd("product_name", v)} placeholder="e.g. iPhone 16 Pro Max 256GB" />
              <Field label="Product Link" value={form.product_link} onChange={(v) => upd("product_link", v)} placeholder="https://..." />
              <Field label="Reference Image URL" value={form.product_image} onChange={(v) => upd("product_image", v)} placeholder="https://..." />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Quantity *" type="number" value={form.quantity} onChange={(v) => upd("quantity", v)} />
                <Field label="Your Budget (৳)" type="number" value={form.budget} onChange={(v) => upd("budget", v)} />
                <Field label="Advance (৳)" type="number" value={form.advance_paid} onChange={(v) => upd("advance_paid", v)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Additional Note
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => upd("note", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Colour, variant, deadline, etc."
                />
              </div>
            </Section>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Submit Pre-Order Request
            </button>
          </form>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border bg-secondary/20 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
