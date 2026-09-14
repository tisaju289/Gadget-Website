import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Palette, Globe, Activity, ChevronDown, LayoutTemplate, Columns, Plus, Trash2, Eye, ShoppingCart, Menu as MenuIcon, ArrowUp, ArrowDown } from "lucide-react";
import { updateSiteSettings } from "@/lib/siteSettings.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="space-y-5 border-t px-6 py-5">{children}</div>}
    </div>
  );
}

const tabs = [
  { id: "brand", label: "Brand", icon: Palette },
  { id: "visibility", label: "Visibility", icon: Eye },
  { id: "header", label: "Header", icon: LayoutTemplate },
  { id: "navigation", label: "Navigation", icon: MenuIcon },
  { id: "footer", label: "Footer", icon: Columns },
  { id: "checkout", label: "Checkout", icon: ShoppingCart },
  { id: "seo", label: "SEO & Meta", icon: Globe },
  { id: "tracking", label: "Tracking & Analytics", icon: Activity },
] as const;

type TabId = (typeof tabs)[number]["id"];

type NavCategoryLink = { id: string; name: string; slug: string };

type TrackingState = {
  fb_pixel_id: string;
  fb_capi_access_token: string;
  fb_test_event_code: string;
  ga_measurement_id: string;
  ga_api_secret: string;
  gtm_id: string;
  google_ads_id: string;
  google_ads_conversion_label: string;
  tiktok_pixel_id: string;
  tiktok_access_token: string;
  snapchat_pixel_id: string;
  pinterest_tag_id: string;
  twitter_pixel_id: string;
  linkedin_partner_id: string;
  hotjar_id: string;
  clarity_id: string;
  gsc_verification: string;
  custom_head_scripts: string;
  custom_body_scripts: string;
};

const emptyTracking: TrackingState = {
  fb_pixel_id: "",
  fb_capi_access_token: "",
  fb_test_event_code: "",
  ga_measurement_id: "",
  ga_api_secret: "",
  gtm_id: "",
  google_ads_id: "",
  google_ads_conversion_label: "",
  tiktok_pixel_id: "",
  tiktok_access_token: "",
  snapchat_pixel_id: "",
  pinterest_tag_id: "",
  twitter_pixel_id: "",
  linkedin_partner_id: "",
  hotjar_id: "",
  clarity_id: "",
  gsc_verification: "",
  custom_head_scripts: "",
  custom_body_scripts: "",
};

function TrackField({
  label,
  k,
  placeholder,
  hint,
  type = "text",
  tracking,
  onChange,
}: {
  label: string;
  k: keyof TrackingState;
  placeholder?: string;
  hint?: string;
  type?: string;
  tracking: TrackingState;
  onChange: (k: keyof TrackingState, v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={tracking[k]}
        onChange={(e) => onChange(k, e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("brand");
  const qc = useQueryClient();
  const saveSiteSettings = useServerFn(updateSiteSettings);
  const { data, isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: categoryOptions = [] } = useQuery({
    queryKey: ["admin-settings", "nav-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);
  const [tracking, setTracking] = useState<TrackingState>(emptyTracking);

  // Header
  const [headerHotline, setHeaderHotline] = useState("");
  const [topbarPhone, setTopbarPhone] = useState("");
  const [bottomNavPhone, setBottomNavPhone] = useState("");
  const [bottomNavWhatsapp, setBottomNavWhatsapp] = useState("");

  // Footer
  const [footerTagline, setFooterTagline] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [footerCopyright, setFooterCopyright] = useState("");
  const [footerFacebook, setFooterFacebook] = useState("");
  const [footerInstagram, setFooterInstagram] = useState("");
  const [footerYoutube, setFooterYoutube] = useState("");
  const [footerLinkedin, setFooterLinkedin] = useState("");
  const [footerBranches, setFooterBranches] = useState<{ name: string; addr: string; phone: string }[]>([]);
  // Checkout
  const [checkoutTitle, setCheckoutTitle] = useState("");
  const [checkoutInsideLabel, setCheckoutInsideLabel] = useState("");
  const [checkoutInsideFee, setCheckoutInsideFee] = useState("");
  const [checkoutInsideNote, setCheckoutInsideNote] = useState("");
  const [checkoutOutsideLabel, setCheckoutOutsideLabel] = useState("");
  const [checkoutOutsideFee, setCheckoutOutsideFee] = useState("");
  const [checkoutOutsideNote, setCheckoutOutsideNote] = useState("");
  const [checkoutCodLabel, setCheckoutCodLabel] = useState("");
  const [checkoutCodNote, setCheckoutCodNote] = useState("");
  const [checkoutSuccessTitle, setCheckoutSuccessTitle] = useState("");
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState("");
  const [checkoutTermsText, setCheckoutTermsText] = useState("");
  const [checkoutShowNoteField, setCheckoutShowNoteField] = useState(true);

  // Navigation
  const [navLinks, setNavLinks] = useState<{ label: string; url: string }[]>([]);
  const [navCategoryLinks, setNavCategoryLinks] = useState<NavCategoryLink[]>([]);
  const [topbarLinks, setTopbarLinks] = useState<{ label: string; url: string; icon?: string }[]>([]);
  const [homeCategoryLimit, setHomeCategoryLimit] = useState(8);
  const [homeCategoryPerRow, setHomeCategoryPerRow] = useState(6);
  const [homeBrandLimit, setHomeBrandLimit] = useState(8);
  const [homeBrandPerRow, setHomeBrandPerRow] = useState(4);
  const [homeFeaturedPerRow, setHomeFeaturedPerRow] = useState(6);
  const [homeBestSellingPerRow, setHomeBestSellingPerRow] = useState(6);
  const [homeNewArrivalsPerRow, setHomeNewArrivalsPerRow] = useState(6);




  type VisKey =
    | "show_topbar" | "show_megamenu" | "show_hotline" | "show_preorder_btn" | "show_header_search"
    | "show_footer_branches" | "show_footer_company" | "show_footer_help" | "show_footer_terms"
    | "show_footer_socials" | "show_mobile_bottom_nav";
  const visKeys: VisKey[] = [
    "show_topbar", "show_megamenu", "show_hotline", "show_preorder_btn", "show_header_search",
    "show_footer_branches", "show_footer_company", "show_footer_help", "show_footer_terms",
    "show_footer_socials", "show_mobile_bottom_nav",
  ];
  const [visibility, setVisibility] = useState<Record<VisKey, boolean>>(
    () => Object.fromEntries(visKeys.map(k => [k, true])) as Record<VisKey, boolean>
  );

  useEffect(() => {
    if (data) {
      setSiteName(data.site_name ?? "");
      setLogoUrl(data.logo_url ?? null);
      setFaviconUrl(data.favicon_url ?? null);
      setMetaTitle(data.meta_title ?? "");
      setMetaDescription(data.meta_description ?? "");
      setMetaKeywords(data.meta_keywords ?? "");
      setOgImageUrl(data.og_image_url ?? null);
      setHeaderHotline(data.header_hotline ?? "");
      setTopbarPhone(data.topbar_phone ?? "");
      setBottomNavPhone((data as Record<string, unknown>).bottom_nav_phone as string ?? "");
      setBottomNavWhatsapp((data as Record<string, unknown>).bottom_nav_whatsapp as string ?? "");
      setFooterTagline(data.footer_tagline ?? "");
      setFooterEmail(data.footer_email ?? "");
      setFooterCopyright(data.footer_copyright ?? "");
      setFooterFacebook(data.footer_facebook ?? "");
      setFooterInstagram(data.footer_instagram ?? "");
      setFooterYoutube(data.footer_youtube ?? "");
      setFooterLinkedin(data.footer_linkedin ?? "");
      setFooterBranches(
        Array.isArray(data.footer_branches)
          ? (data.footer_branches as unknown as { name: string; addr: string; phone: string }[])
          : []
      );
      const d = data as Record<string, unknown>;
      setCheckoutTitle((d.checkout_title as string) ?? "");
      setCheckoutInsideLabel((d.checkout_inside_label as string) ?? "");
      setCheckoutInsideFee(d.checkout_inside_fee != null ? String(d.checkout_inside_fee) : "");
      setCheckoutInsideNote((d.checkout_inside_note as string) ?? "");
      setCheckoutOutsideLabel((d.checkout_outside_label as string) ?? "");
      setCheckoutOutsideFee(d.checkout_outside_fee != null ? String(d.checkout_outside_fee) : "");
      setCheckoutOutsideNote((d.checkout_outside_note as string) ?? "");
      setCheckoutCodLabel((d.checkout_cod_label as string) ?? "");
      setCheckoutCodNote((d.checkout_cod_note as string) ?? "");
      setCheckoutSuccessTitle((d.checkout_success_title as string) ?? "");
      setCheckoutSuccessMessage((d.checkout_success_message as string) ?? "");
      setCheckoutTermsText((d.checkout_terms_text as string) ?? "");
      setCheckoutShowNoteField(d.checkout_show_note_field !== false);
      setNavLinks(
        Array.isArray(d.nav_links)
          ? (d.nav_links as { label: string; url: string }[]).filter((x) => x && typeof x === "object")
          : []
      );
      setNavCategoryLinks(
        Array.isArray(d.nav_category_links)
          ? (d.nav_category_links as NavCategoryLink[]).filter((x) => x && typeof x === "object" && x.id && x.name && x.slug)
          : []
      );
      setHomeCategoryLimit(readNumber(d.home_category_limit, 8, 2, 12));
      setHomeCategoryPerRow(readNumber(d.home_category_per_row, 6, 2, 8));
      setHomeBrandLimit(readNumber(d.home_brand_limit, 8, 2, 16));
      setHomeBrandPerRow(readNumber(d.home_brand_per_row, 4, 2, 6));
      setHomeFeaturedPerRow(readNumber(d.home_featured_per_row, 6, 2, 8));
      setHomeBestSellingPerRow(readNumber(d.home_best_selling_per_row, 6, 2, 8));
      setHomeNewArrivalsPerRow(readNumber(d.home_new_arrivals_per_row, 6, 2, 8));
      setTopbarLinks(
        Array.isArray(d.topbar_links)
          ? (d.topbar_links as { label: string; url: string; icon?: string }[]).filter((x) => x && typeof x === "object")
          : []
      );
      setVisibility(prev => {
        const next = { ...prev };
        visKeys.forEach(k => {
          const v = (data as Record<string, unknown>)[k];
          if (typeof v === "boolean") next[k] = v;
        });
        return next;
      });
      const next: TrackingState = { ...emptyTracking };
      (Object.keys(emptyTracking) as Array<keyof TrackingState>).forEach((k) => {
        const v = (data as Record<string, unknown>)[k];
        next[k] = typeof v === "string" ? v : "";
      });
      setTracking(next);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data) throw new Error("Settings not loaded");
      const trackingPayload: Record<string, string | null> = {};
      (Object.keys(tracking) as Array<keyof TrackingState>).forEach((k) => {
        const v = tracking[k].trim();
        trackingPayload[k] = v ? v : null;
      });

      await saveSiteSettings({
        data: {
          id: data.id,
          site_name: siteName.trim() || "Nexio",
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          meta_keywords: metaKeywords.trim() || null,
          og_image_url: ogImageUrl,
          header_hotline: headerHotline.trim() || null,
          topbar_phone: topbarPhone.trim() || null,
          bottom_nav_phone: bottomNavPhone.trim() || null,
          bottom_nav_whatsapp: bottomNavWhatsapp.trim() || null,
          footer_tagline: footerTagline.trim() || null,
          footer_email: footerEmail.trim() || null,
          footer_copyright: footerCopyright.trim() || null,
          footer_facebook: footerFacebook.trim() || null,
          footer_instagram: footerInstagram.trim() || null,
          footer_youtube: footerYoutube.trim() || null,
          footer_linkedin: footerLinkedin.trim() || null,
          footer_branches: footerBranches.filter((b) => b.name.trim() || b.addr.trim() || b.phone.trim()),
          checkout_title: checkoutTitle.trim() || null,
          checkout_inside_label: checkoutInsideLabel.trim() || null,
          checkout_inside_fee: checkoutInsideFee.trim() === "" ? null : Number(checkoutInsideFee),
          checkout_inside_note: checkoutInsideNote.trim() || null,
          checkout_outside_label: checkoutOutsideLabel.trim() || null,
          checkout_outside_fee: checkoutOutsideFee.trim() === "" ? null : Number(checkoutOutsideFee),
          checkout_outside_note: checkoutOutsideNote.trim() || null,
          checkout_cod_label: checkoutCodLabel.trim() || null,
          checkout_cod_note: checkoutCodNote.trim() || null,
          checkout_success_title: checkoutSuccessTitle.trim() || null,
          checkout_success_message: checkoutSuccessMessage.trim() || null,
          checkout_terms_text: checkoutTermsText.trim() || null,
          checkout_show_note_field: checkoutShowNoteField,
          nav_links: navLinks.filter((l) => l.label.trim() && l.url.trim()),
          nav_category_links: navCategoryLinks,
          topbar_links: topbarLinks.filter((l) => l.label.trim() && l.url.trim()).map((l) => ({
            icon: l.icon?.trim() || undefined,
            label: l.label.trim(),
            url: l.url.trim(),
          })),
          home_category_limit: homeCategoryLimit,
          home_category_per_row: homeCategoryPerRow,
          home_brand_limit: homeBrandLimit,
          home_brand_per_row: homeBrandPerRow,
          home_featured_per_row: homeFeaturedPerRow,
          home_best_selling_per_row: homeBestSellingPerRow,
          home_new_arrivals_per_row: homeNewArrivalsPerRow,
          ...visibility,
          ...trackingPayload,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Settings saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const field =
    "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary";
  const textarea =
    "w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary";

  const update = (k: keyof TrackingState, v: string) =>
    setTracking((t) => ({ ...t, [k]: v }));

  const updateEvent = (k: keyof TrackingState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setTracking((t) => ({ ...t, [k]: e.target.value }));



  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-sm text-muted-foreground">
          Brand identity, SEO meta tags and marketing tracking.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Brand Tab */}
      {activeTab === "brand" && (
        <Section title="Brand">
          <div className="space-y-2">
            <label className="text-sm font-medium">Website Name</label>
            <input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Nexio"
              className={field}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Logo</label>
            <ImageUploader value={logoUrl} onChange={setLogoUrl} folder="site" />
            <p className="text-xs text-muted-foreground">
              Recommended: transparent PNG, ~200×60px.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Favicon</label>
            <ImageUploader value={faviconUrl} onChange={setFaviconUrl} folder="site" />
            <p className="text-xs text-muted-foreground">
              Recommended: square PNG/ICO, 32×32 or 64×64px.
            </p>
          </div>
        </Section>
      )}

      {/* Visibility Tab */}
      {activeTab === "visibility" && (
        <div className="space-y-4">
          <Section title="Header Sections">
            {([
              ["show_topbar", "Top Bar"],
              ["show_megamenu", "Category Mega Menu"],
              ["show_header_search", "Search Bar"],
              ["show_hotline", "Hotline (right side)"],
              ["show_preorder_btn", "Pre-Order Button"],
            ] as [VisKey, string][]).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm font-medium">{label}</span>
                <input
                  type="checkbox"
                  checked={visibility[k]}
                  onChange={(e) => setVisibility(v => ({ ...v, [k]: e.target.checked }))}
                  className="h-5 w-5 accent-primary"
                />
              </label>
            ))}
          </Section>
          <Section title="Footer Sections">
            {([
              ["show_footer_socials", "Social Icons"],
              ["show_footer_company", "Company Links"],
              ["show_footer_help", "Help Center Links"],
              ["show_footer_terms", "Terms & Conditions Links"],
              ["show_footer_branches", "Branches Grid"],
            ] as [VisKey, string][]).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm font-medium">{label}</span>
                <input
                  type="checkbox"
                  checked={visibility[k]}
                  onChange={(e) => setVisibility(v => ({ ...v, [k]: e.target.checked }))}
                  className="h-5 w-5 accent-primary"
                />
              </label>
            ))}
          </Section>
          <Section title="Mobile">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3">
              <span className="text-sm font-medium">Mobile Bottom Navigation</span>
              <input
                type="checkbox"
                checked={visibility.show_mobile_bottom_nav}
                onChange={(e) => setVisibility(v => ({ ...v, show_mobile_bottom_nav: e.target.checked }))}
                className="h-5 w-5 accent-primary"
              />
            </label>
          </Section>
        </div>
      )}

      {/* Header Tab */}
      {activeTab === "header" && (
        <Section title="Header & Top Bar">
          <div className="space-y-2">
            <label className="text-sm font-medium">Top Bar Phone</label>
            <input
              value={topbarPhone}
              onChange={(e) => setTopbarPhone(e.target.value)}
              placeholder="+880 1700-000000"
              className={field}
            />
            <p className="text-xs text-muted-foreground">Shown in the top thin bar on desktop.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hotline Number</label>
            <input
              value={headerHotline}
              onChange={(e) => setHeaderHotline(e.target.value)}
              placeholder="16263"
              className={field}
            />
            <p className="text-xs text-muted-foreground">Shown on the right side of the main category nav.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Bottom Nav — Phone Number</label>
            <input
              value={bottomNavPhone}
              onChange={(e) => setBottomNavPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className={field}
            />
            <p className="text-xs text-muted-foreground">Tapping the Phone button opens a call to this number.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Bottom Nav — WhatsApp Number</label>
            <input
              value={bottomNavWhatsapp}
              onChange={(e) => setBottomNavWhatsapp(e.target.value)}
              placeholder="8801XXXXXXXXX (with country code, no +)"
              className={field}
            />
            <p className="text-xs text-muted-foreground">Tapping the WhatsApp button opens a chat with this number.</p>
          </div>
        </Section>
      )}

      {activeTab === "header" && (
        <Section title="Top Bar Links" defaultOpen={false}>
          <p className="-mt-2 text-xs text-muted-foreground">
            The small links on the far right of the top bar (Order Tracking, Blog, etc.). Add, edit, reorder or remove. Icon can be: <code>truck, gift, blog, emi, map, info, star, tag, heart, bag, home, store, package, help, phone</code>. Leave empty for a default icon.
          </p>
          <div className="space-y-2">
            {topbarLinks.length === 0 && (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-xs text-muted-foreground">Defaults are shown until you add your own.</p>
                <button
                  type="button"
                  onClick={() => setTopbarLinks([
                    { icon: "truck", label: "Order Tracking", url: "#" },
                    { icon: "gift", label: "Gift", url: "#" },
                    { icon: "blog", label: "Blog", url: "#" },
                    { icon: "emi", label: "EMI Policy", url: "#" },
                    { icon: "map", label: "Store Location", url: "#" },
                  ])}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground"
                >
                  Load defaults to edit
                </button>
              </div>
            )}
            {topbarLinks.map((l, i) => (
              <div key={i} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[120px_1fr_2fr_auto_auto_auto]">
                <input value={l.icon ?? ""} onChange={(e) => setTopbarLinks((arr) => arr.map((x, idx) => idx === i ? { ...x, icon: e.target.value } : x))} placeholder="icon" className={field} />
                <input value={l.label} onChange={(e) => setTopbarLinks((arr) => arr.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} placeholder="Label" className={field} />
                <input value={l.url} onChange={(e) => setTopbarLinks((arr) => arr.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x))} placeholder="/blog or https://..." className={field} />
                <button type="button" disabled={i === 0} onClick={() => setTopbarLinks((arr) => { const n = [...arr]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-secondary disabled:opacity-40" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={i === topbarLinks.length - 1} onClick={() => setTopbarLinks((arr) => { const n = [...arr]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n; })} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-secondary disabled:opacity-40" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => setTopbarLinks((arr) => arr.filter((_, idx) => idx !== i))} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-destructive hover:bg-destructive/10" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setTopbarLinks((arr) => [...arr, { label: "", url: "", icon: "" }])} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-secondary">
              <Plus className="h-4 w-4" /> Add Link
            </button>
          </div>
        </Section>
      )}

      {/* Navigation Tab */}
      {activeTab === "navigation" && (
        <div className="space-y-4">
          <Section title="Main Navigation Links">
            <p className="-mt-2 text-xs text-muted-foreground">
              These links appear in the top navigation bar (next to "All Categories"). Add any page — categories (e.g. <code>/category/phones</code>), offers (<code>/products?sort=best</code>), the pre-order page, blog, or any external URL.
            </p>
            <div className="space-y-2">
              {navLinks.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    No custom links yet. Default links (Home, Shop, Best Selling, New Arrivals, Hot Offer, Brands, Pre-Order) are shown until you add your own.
                  </p>
                  <button
                    type="button"
                    onClick={() => setNavLinks([
                      { label: "Home", url: "/" },
                      { label: "Shop", url: "/products" },
                      { label: "Best Selling", url: "/products?filter=best_deals" },
                      { label: "New Arrivals", url: "/products?filter=new_arrivals" },
                      { label: "Hot Offer", url: "/products?filter=flash_sale" },
                      { label: "Brands", url: "/brands" },
                      { label: "Pre-Order", url: "/preorder" },
                    ])}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground"
                  >
                    Load defaults to edit
                  </button>
                </div>
              )}
              {navLinks.map((l, i) => (
                <div key={i} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_2fr_auto_auto_auto]">
                  <input
                    value={l.label}
                    onChange={(e) => setNavLinks((arr) => arr.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                    placeholder="Label (e.g. Hot Offer)"
                    className={field}
                  />
                  <input
                    value={l.url}
                    onChange={(e) => setNavLinks((arr) => arr.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x))}
                    placeholder="/products?sort=best  or  /category/phones"
                    className={field}
                  />
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => setNavLinks((arr) => {
                      const n = [...arr]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n;
                    })}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-secondary disabled:opacity-40"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={i === navLinks.length - 1}
                    onClick={() => setNavLinks((arr) => {
                      const n = [...arr]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n;
                    })}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-secondary disabled:opacity-40"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setNavLinks((arr) => arr.filter((_, idx) => idx !== i))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-destructive hover:bg-destructive/10"
                    aria-label="Remove link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNavLinks((arr) => [...arr, { label: "", url: "" }])}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                <Plus className="h-4 w-4" /> Add Link
              </button>
            </div>
          </Section>

          <Section title="Category Shortcuts">
            <p className="-mt-2 text-xs text-muted-foreground">
              Add only the categories you want beside your custom navigation links. The old automatic top 6 category option is removed.
            </p>
            <div className="space-y-2">
              {navCategoryLinks.map((cat, i) => (
                <div key={`${cat.id}-${i}`} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_auto_auto_auto]">
                  <select
                    value={cat.id}
                    onChange={(e) => {
                      const picked = categoryOptions.find((c) => c.id === e.target.value);
                      if (!picked) return;
                      setNavCategoryLinks((arr) => arr.map((x, idx) => idx === i ? { id: picked.id, name: picked.name, slug: picked.slug } : x));
                    }}
                    className={field}
                  >
                    <option value={cat.id}>{cat.name}</option>
                    {categoryOptions.filter((c) => c.id !== cat.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button type="button" disabled={i === 0} onClick={() => setNavCategoryLinks((arr) => { const n = [...arr]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-secondary disabled:opacity-40" aria-label="Move category up"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" disabled={i === navCategoryLinks.length - 1} onClick={() => setNavCategoryLinks((arr) => { const n = [...arr]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n; })} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-secondary disabled:opacity-40" aria-label="Move category down"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setNavCategoryLinks((arr) => arr.filter((_, idx) => idx !== i))} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-destructive hover:bg-destructive/10" aria-label="Remove category"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const picked = categoryOptions.find((c) => !navCategoryLinks.some((x) => x.id === c.id)) ?? categoryOptions[0];
                  if (!picked) return;
                  setNavCategoryLinks((arr) => [...arr, { id: picked.id, name: picked.name, slug: picked.slug }]);
                }}
                disabled={categoryOptions.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-secondary disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Add Category
              </button>
            </div>
          </Section>

          <Section title="Home Page Rows">
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Home categories shown" value={homeCategoryLimit} min={2} max={12} onChange={setHomeCategoryLimit} />
              <NumberField label="Categories per row" value={homeCategoryPerRow} min={2} max={8} onChange={setHomeCategoryPerRow} />
              <NumberField label="Home brands shown" value={homeBrandLimit} min={2} max={16} onChange={setHomeBrandLimit} />
              <NumberField label="Brands per row" value={homeBrandPerRow} min={2} max={6} onChange={setHomeBrandPerRow} />
              <NumberField label="Featured Products per row" value={homeFeaturedPerRow} min={2} max={8} onChange={setHomeFeaturedPerRow} />
              <NumberField label="Best Selling Products per row" value={homeBestSellingPerRow} min={2} max={8} onChange={setHomeBestSellingPerRow} />
              <NumberField label="New Arrivals per row" value={homeNewArrivalsPerRow} min={2} max={8} onChange={setHomeNewArrivalsPerRow} />
            </div>
          </Section>
        </div>
      )}

      {/* Footer Tab */}

      {activeTab === "footer" && (
        <div className="space-y-4">
          <Section title="Footer Content">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline</label>
              <textarea
                value={footerTagline}
                onChange={(e) => setFooterTagline(e.target.value)}
                placeholder="Bangladesh's premium tech destination..."
                rows={2}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <input
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                placeholder="support@nexio.com.bd"
                className={field}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Copyright Text</label>
              <input
                value={footerCopyright}
                onChange={(e) => setFooterCopyright(e.target.value)}
                placeholder={`© ${new Date().getFullYear()} Nexio. All rights reserved.`}
                className={field}
              />
            </div>
          </Section>

          <Section title="Social Links" defaultOpen={false}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Facebook URL</label>
              <input value={footerFacebook} onChange={(e) => setFooterFacebook(e.target.value)} placeholder="https://facebook.com/..." className={field} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Instagram URL</label>
              <input value={footerInstagram} onChange={(e) => setFooterInstagram(e.target.value)} placeholder="https://instagram.com/..." className={field} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">YouTube URL</label>
              <input value={footerYoutube} onChange={(e) => setFooterYoutube(e.target.value)} placeholder="https://youtube.com/..." className={field} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn URL</label>
              <input value={footerLinkedin} onChange={(e) => setFooterLinkedin(e.target.value)} placeholder="https://linkedin.com/..." className={field} />
            </div>
          </Section>

          <Section title="Branches" defaultOpen={false}>
            <div className="space-y-3">
              {footerBranches.map((b, i) => (
                <div key={i} className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_2fr_1fr_auto]">
                  <input
                    value={b.name}
                    onChange={(e) => setFooterBranches(arr => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                    placeholder="Branch name"
                    className={field}
                  />
                  <input
                    value={b.addr}
                    onChange={(e) => setFooterBranches(arr => arr.map((x, idx) => idx === i ? { ...x, addr: e.target.value } : x))}
                    placeholder="Address"
                    className={field}
                  />
                  <input
                    value={b.phone}
                    onChange={(e) => setFooterBranches(arr => arr.map((x, idx) => idx === i ? { ...x, phone: e.target.value } : x))}
                    placeholder="Phone"
                    className={field}
                  />
                  <button
                    type="button"
                    onClick={() => setFooterBranches(arr => arr.filter((_, idx) => idx !== i))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border text-destructive hover:bg-destructive/10"
                    aria-label="Remove branch"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFooterBranches(arr => [...arr, { name: "", addr: "", phone: "" }])}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-secondary"
              >
                <Plus className="h-4 w-4" /> Add Branch
              </button>
            </div>
          </Section>
        </div>
      )}

      {/* Checkout Tab */}
      {activeTab === "checkout" && (
        <div className="space-y-4">
          <Section title="Page">
            <div className="space-y-2">
              <label className="text-sm font-medium">Page Title</label>
              <input value={checkoutTitle} onChange={(e) => setCheckoutTitle(e.target.value)} placeholder="Checkout" className={field} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checkoutShowNoteField}
                onChange={(e) => setCheckoutShowNoteField(e.target.checked)}
                className="h-4 w-4"
              />
              Show optional "Order Note" field
            </label>
          </Section>

          <Section title="Inside Dhaka Delivery">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <input value={checkoutInsideLabel} onChange={(e) => setCheckoutInsideLabel(e.target.value)} placeholder="Inside Dhaka" className={field} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fee (BDT)</label>
                <input type="number" min="0" value={checkoutInsideFee} onChange={(e) => setCheckoutInsideFee(e.target.value)} placeholder="60" className={field} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <input value={checkoutInsideNote} onChange={(e) => setCheckoutInsideNote(e.target.value)} placeholder="Delivery within 1-2 business days." className={field} />
            </div>
          </Section>

          <Section title="Outside Dhaka Delivery">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <input value={checkoutOutsideLabel} onChange={(e) => setCheckoutOutsideLabel(e.target.value)} placeholder="Outside Dhaka" className={field} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fee (BDT)</label>
                <input type="number" min="0" value={checkoutOutsideFee} onChange={(e) => setCheckoutOutsideFee(e.target.value)} placeholder="120" className={field} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <input value={checkoutOutsideNote} onChange={(e) => setCheckoutOutsideNote(e.target.value)} placeholder="Delivery within 2-4 business days." className={field} />
            </div>
          </Section>

          <Section title="Payment (Cash on Delivery)">
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <input value={checkoutCodLabel} onChange={(e) => setCheckoutCodLabel(e.target.value)} placeholder="Cash on Delivery (COD)" className={field} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <input value={checkoutCodNote} onChange={(e) => setCheckoutCodNote(e.target.value)} placeholder="Pay when your order is delivered to your doorstep." className={field} />
            </div>
          </Section>

          <Section title="Order Placed Screen">
            <div className="space-y-2">
              <label className="text-sm font-medium">Success Title</label>
              <input value={checkoutSuccessTitle} onChange={(e) => setCheckoutSuccessTitle(e.target.value)} placeholder="Order placed!" className={field} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Success Message</label>
              <textarea rows={3} value={checkoutSuccessMessage} onChange={(e) => setCheckoutSuccessMessage(e.target.value)} placeholder="Thank you for shopping with us. Our team will call you shortly to confirm your order." className={textarea} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Terms text (below Place Order button)</label>
              <input value={checkoutTermsText} onChange={(e) => setCheckoutTermsText(e.target.value)} placeholder="By placing the order you agree to our terms." className={field} />
            </div>
          </Section>
        </div>
      )}


      {/* SEO Tab */}
      {activeTab === "seo" && (
        <Section title="SEO & Meta Tags">
          <div className="space-y-2">
            <label className="text-sm font-medium">Meta Title</label>
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Nexio — Premium Tech Store, Bangladesh"
              maxLength={70}
              className={field}
            />
            <p className="text-xs text-muted-foreground">
              {metaTitle.length}/70 characters · shown in browser tab & Google results
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Meta Description</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Smartphones, laptops, tablets & accessories. 0% EMI across Bangladesh."
              maxLength={170}
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">
              {metaDescription.length}/170 characters
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Meta Keywords</label>
            <input
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="smartphone, laptop, tablet, accessories, bangladesh"
              className={field}
            />
            <p className="text-xs text-muted-foreground">Comma-separated keywords.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Social Share Image (Open Graph)</label>
            <ImageUploader value={ogImageUrl} onChange={setOgImageUrl} folder="site" />
            <p className="text-xs text-muted-foreground">
              Recommended: 1200×630px. Shown when your link is shared on Facebook, WhatsApp, Twitter, etc.
            </p>
          </div>
        </Section>
      )}

      {/* Tracking Tab */}
      {activeTab === "tracking" && (
        <div className="space-y-4">
          {/* Facebook / Meta */}
          <Section title="Facebook / Meta (Pixel + CAPI)">
            <TrackField tracking={tracking} onChange={update}
              label="Facebook Pixel ID"
              k="fb_pixel_id"
              placeholder="1234567890123456"
              hint="Events Manager → Data Sources → your Pixel ID."
            />
            <TrackField tracking={tracking} onChange={update}
              label="Conversions API (CAPI) Access Token"
              k="fb_capi_access_token"
              type="password"
              placeholder="EAAB..."
              hint="Used to send server-side events. Generated in Events Manager → Settings → CAPI."
            />
            <TrackField tracking={tracking} onChange={update}
              label="Test Event Code (optional)"
              k="fb_test_event_code"
              placeholder="TEST12345"
              hint="Use while testing in Events Manager → Test Events."
            />
          </Section>

          {/* Google */}
          <Section title="Google Analytics & Ads" defaultOpen={false}>
            <TrackField tracking={tracking} onChange={update}
              label="GA4 Measurement ID"
              k="ga_measurement_id"
              placeholder="G-XXXXXXXXXX"
            />
            <TrackField tracking={tracking} onChange={update}
              label="GA4 Measurement Protocol API Secret"
              k="ga_api_secret"
              type="password"
              placeholder="abc123..."
              hint="For server-side GA4 events."
            />
            <TrackField tracking={tracking} onChange={update}
              label="Google Tag Manager ID"
              k="gtm_id"
              placeholder="GTM-XXXXXXX"
            />
            <TrackField tracking={tracking} onChange={update}
              label="Google Ads Conversion ID"
              k="google_ads_id"
              placeholder="AW-XXXXXXXXXX"
            />
            <TrackField tracking={tracking} onChange={update}
              label="Google Ads Conversion Label"
              k="google_ads_conversion_label"
              placeholder="abcDEF123"
            />
            <TrackField tracking={tracking} onChange={update}
              label="Google Search Console Verification"
              k="gsc_verification"
              placeholder="google-site-verification token"
            />
          </Section>

          {/* TikTok */}
          <Section title="TikTok" defaultOpen={false}>
            <TrackField tracking={tracking} onChange={update}
              label="TikTok Pixel ID"
              k="tiktok_pixel_id"
              placeholder="C4XXXXXXXXXXXXXXXX"
            />
            <TrackField tracking={tracking} onChange={update}
              label="TikTok Events API Access Token"
              k="tiktok_access_token"
              type="password"
              placeholder="Server-side events token"
            />
          </Section>

          {/* Other social */}
          <Section title="Other Pixels" defaultOpen={false}>
            <TrackField tracking={tracking} onChange={update} label="Snapchat Pixel ID" k="snapchat_pixel_id" placeholder="xxxxxxxx-xxxx-..." />
            <TrackField tracking={tracking} onChange={update} label="Pinterest Tag ID" k="pinterest_tag_id" placeholder="2613..." />
            <TrackField tracking={tracking} onChange={update} label="Twitter / X Pixel ID" k="twitter_pixel_id" placeholder="oXXXX" />
            <TrackField tracking={tracking} onChange={update} label="LinkedIn Partner ID" k="linkedin_partner_id" placeholder="123456" />
          </Section>

          {/* Heatmaps */}
          <Section title="Heatmaps & Session Recording" defaultOpen={false}>
            <TrackField tracking={tracking} onChange={update} label="Hotjar Site ID" k="hotjar_id" placeholder="1234567" />
            <TrackField tracking={tracking} onChange={update} label="Microsoft Clarity Project ID" k="clarity_id" placeholder="abcd1234ef" />
          </Section>

          {/* Custom */}
          <Section title="Custom Scripts" defaultOpen={false}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom &lt;head&gt; Scripts</label>
              <textarea
                value={tracking.custom_head_scripts}
                onChange={updateEvent("custom_head_scripts")}
                placeholder="<!-- Pasted raw HTML/JS injected inside <head> -->"
                rows={5}
                className={textarea}
              />
              <p className="text-xs text-muted-foreground">
                Paste any verification meta or third-party snippet. Injected on every page.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom &lt;body&gt; Scripts</label>
              <textarea
                value={tracking.custom_body_scripts}
                onChange={updateEvent("custom_body_scripts")}
                placeholder="<!-- e.g. noscript pixel fallback, chat widgets -->"
                rows={5}
                className={textarea}
              />
            </div>
          </Section>
        </div>
      )}

      <button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </button>
    </div>
  );
}


function readNumber(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(readNumber(e.target.value, value, min, max))}
        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
