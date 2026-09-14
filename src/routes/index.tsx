import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { HeroSlider } from "@/components/home/HeroSlider";
import { TrustBadges } from "@/components/home/TrustBadges";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { FlashSale } from "@/components/home/FlashSale";
import { BestDeals } from "@/components/home/BestDeals";
import { BestSelling } from "@/components/home/BestSelling";
import { NewArrivals } from "@/components/home/NewArrivals";
import { ShopByBrands } from "@/components/home/ShopByBrands";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexio — Smartphones, Laptops & Gadgets in Bangladesh" },
      { name: "description", content: "Shop genuine smartphones, laptops, tablets, smart watches and accessories at Nexio Bangladesh. 0% EMI, fast delivery, 2 years replacement." },
      { property: "og:title", content: "Nexio — Premium Tech Store, Bangladesh" },
      { property: "og:description", content: "Authentic gadgets, flash sales, and 0% EMI across Bangladesh." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-secondary/40">
      <TopBar />
      <Header />
      <MegaMenu />

      <main>
        <HeroSlider />
        <ShopByCategory />
        <FlashSale />
        <BestDeals />
        <BestSelling />
        <TrustBadges />
        <NewArrivals />
        <ShopByBrands />
      </main>


      <Footer />
      <MobileBottomNav />
    </div>
  );
}
