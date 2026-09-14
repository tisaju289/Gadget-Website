import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";
import { ShopBrowser } from "@/components/shop/ShopBrowser";

export const Route = createFileRoute("/brand/$slug")({
  component: BrandPage,
});

function BrandPage() {
  const { slug } = Route.useParams();

  const { data: brand } = useQuery({
    queryKey: ["brand", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, slug, image_url")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["brand-products", brand?.name],
    enabled: !!brand?.name,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, brand, image_url, price, original_price, label, stock, created_at")
        .ilike("brand", brand!.name)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-secondary/30">
      <TopBar />
      <Header />
      <MegaMenu />

      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/brands" className="hover:text-foreground">Brands</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{brand?.name ?? slug}</span>
        </nav>

        <h1 className="mb-5 flex items-center gap-2 text-xl font-bold md:text-2xl">
          <span className="text-sale">»</span> {brand?.name ?? "Brand"}
        </h1>

        <ShopBrowser products={products ?? []} isLoading={isLoading} />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
