import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const nullableString = z.string().nullable();

const settingsSchema = z.object({
  id: z.string().uuid(),
  site_name: z.string().min(1),
  logo_url: nullableString,
  favicon_url: nullableString,
  meta_title: nullableString,
  meta_description: nullableString,
  meta_keywords: nullableString,
  og_image_url: nullableString,
  header_hotline: nullableString,
  topbar_phone: nullableString,
  bottom_nav_phone: nullableString,
  bottom_nav_whatsapp: nullableString,
  footer_tagline: nullableString,
  footer_email: nullableString,
  footer_copyright: nullableString,
  footer_facebook: nullableString,
  footer_instagram: nullableString,
  footer_youtube: nullableString,
  footer_linkedin: nullableString,
  footer_branches: z.array(z.object({ name: z.string(), addr: z.string(), phone: z.string() })),
  checkout_title: nullableString,
  checkout_inside_label: nullableString,
  checkout_inside_fee: z.number().nullable(),
  checkout_inside_note: nullableString,
  checkout_outside_label: nullableString,
  checkout_outside_fee: z.number().nullable(),
  checkout_outside_note: nullableString,
  checkout_cod_label: nullableString,
  checkout_cod_note: nullableString,
  checkout_success_title: nullableString,
  checkout_success_message: nullableString,
  checkout_terms_text: nullableString,
  checkout_show_note_field: z.boolean(),
  nav_links: z.array(z.object({ label: z.string(), url: z.string() })),
  nav_category_links: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
  topbar_links: z.array(z.object({ icon: z.string().optional(), label: z.string(), url: z.string() })),
  home_category_limit: z.number().int().min(2).max(12),
  home_category_per_row: z.number().int().min(2).max(8),
  home_brand_limit: z.number().int().min(2).max(16),
  home_brand_per_row: z.number().int().min(2).max(6),
  home_featured_per_row: z.number().int().min(2).max(8),
  home_best_selling_per_row: z.number().int().min(2).max(8),
  home_new_arrivals_per_row: z.number().int().min(2).max(8),
  show_topbar: z.boolean(),
  show_megamenu: z.boolean(),
  show_hotline: z.boolean(),
  show_preorder_btn: z.boolean(),
  show_header_search: z.boolean(),
  show_footer_branches: z.boolean(),
  show_footer_company: z.boolean(),
  show_footer_help: z.boolean(),
  show_footer_terms: z.boolean(),
  show_footer_socials: z.boolean(),
  show_mobile_bottom_nav: z.boolean(),
  fb_pixel_id: nullableString,
  fb_capi_access_token: nullableString,
  fb_test_event_code: nullableString,
  ga_measurement_id: nullableString,
  ga_api_secret: nullableString,
  gtm_id: nullableString,
  google_ads_id: nullableString,
  google_ads_conversion_label: nullableString,
  tiktok_pixel_id: nullableString,
  tiktok_access_token: nullableString,
  snapchat_pixel_id: nullableString,
  pinterest_tag_id: nullableString,
  twitter_pixel_id: nullableString,
  linkedin_partner_id: nullableString,
  hotjar_id: nullableString,
  clarity_id: nullableString,
  gsc_verification: nullableString,
  custom_head_scripts: nullableString,
  custom_body_scripts: nullableString,
});

export const updateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => settingsSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (roleError) throw roleError;
    if (!isAdmin) throw new Error("Only admins can save settings");

    const { id, ...payload } = data;
    const { error } = await context.supabase
      .from("site_settings")
      .update(payload)
      .eq("id", id);

    if (error) throw error;
    return { ok: true };
  });