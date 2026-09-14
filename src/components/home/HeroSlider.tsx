import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { proxyImg } from "@/lib/img";
import bannerFlash from "@/assets/banner-flash.webp";
import bannerEmi from "@/assets/banner-emi.webp";
import bannerNew from "@/assets/banner-new.webp";
import miniDelivery from "@/assets/mini-delivery.webp";
import miniCashback from "@/assets/mini-cashback.webp";

type Banner = { id: string; title: string | null; image_url: string; link_url: string | null; position: string };

const fallbackHero: Banner[] = [
  { id: "f1", title: "Flash Sale up to 50% off", image_url: bannerFlash, link_url: null, position: "hero" },
  { id: "f2", title: "New iPhone Arrival", image_url: bannerNew, link_url: null, position: "hero" },
  { id: "f3", title: "0% EMI up to 36 months", image_url: bannerEmi, link_url: null, position: "hero" },
];
const fallbackMini: Banner[] = [
  { id: "m1", title: "Free Delivery", image_url: miniDelivery, link_url: null, position: "mini" },
  { id: "m2", title: "Cashback Offer", image_url: miniCashback, link_url: null, position: "mini" },
];

export function HeroSlider() {
  const [i, setI] = useState(0);

  const { data } = useQuery({
    queryKey: ["banners", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("id, title, image_url, link_url, position")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Banner[];
    },
  });

  const heroFromDb = (data ?? []).filter((b) => b.position === "hero");
  const miniFromDb = (data ?? []).filter((b) => b.position === "mini");
  const slides = heroFromDb.length > 0 ? heroFromDb : fallbackHero;
  const minis = (miniFromDb.length > 0 ? miniFromDb : fallbackMini).slice(0, 2);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const safeI = i % slides.length;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 md:pt-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="relative overflow-hidden rounded-xl shadow-[var(--shadow-card)] md:aspect-[21/9] aspect-[16/10]">
          {slides.map((s, idx) => {
            const img = (
              <img
                src={proxyImg(s.image_url, 1600)}
                alt={s.title ?? "Banner"}
                width={1600}
                height={900}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${idx === safeI ? "opacity-100" : "opacity-0"}`}
              />
            );
            return s.link_url ? (
              <a key={s.id} href={s.link_url} className="absolute inset-0">{img}</a>
            ) : (
              <div key={s.id} className="absolute inset-0">{img}</div>
            );
          })}

          {slides.length > 1 && (
            <>
              <button
                onClick={() => setI((safeI - 1 + slides.length) % slides.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow backdrop-blur transition-colors hover:bg-background"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setI((safeI + 1) % slides.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow backdrop-blur transition-colors hover:bg-background"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${idx === safeI ? "w-6 bg-sale" : "w-1.5 bg-background/60"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </section>
  );
}
