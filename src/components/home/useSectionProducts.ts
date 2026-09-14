import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductLabel } from "@/data/products";

type Flag = "is_flash_sale" | "is_featured" | "is_new_arrival";

export function useSectionProducts(flag: Flag, limit = 12) {
  return useQuery({
    queryKey: ["home", "section", flag, limit],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, brand, image_url, price, original_price, label")
        .eq("is_active", true)
        .eq(flag, true)
        .order("sort_order", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        brand: r.brand ?? "",
        image: r.image_url ?? "",
        price: Number(r.price),
        originalPrice: r.original_price ? Number(r.original_price) : Number(r.price),
        label: (r.label as ProductLabel | null) ?? undefined,
      }));
    },
  });
}
