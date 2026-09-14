import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Route as RootRoute } from "@/routes/__root";

// Shared single source for site_settings. Root loader pre-populates this cache.
export function useSiteSettings() {
  const rootSettings = RootRoute.useLoaderData();

  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      return data;
    },
    initialData: rootSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });
}
