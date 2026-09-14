import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { InstallAppPrompt } from "@/components/layout/InstallAppPrompt";

import { setProxyOptions } from "@/lib/img";
import { useEffect } from "react";

import appCss from "../styles.css?url";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

type SiteSettings = {
  site_name?: string | null;
  favicon_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_image_url?: string | null;
  fb_pixel_id?: string | null;
  ga_measurement_id?: string | null;
  gtm_id?: string | null;
  google_ads_id?: string | null;
  tiktok_pixel_id?: string | null;
  snapchat_pixel_id?: string | null;
  pinterest_tag_id?: string | null;
  twitter_pixel_id?: string | null;
  linkedin_partner_id?: string | null;
  hotjar_id?: string | null;
  clarity_id?: string | null;
  gsc_verification?: string | null;
  custom_head_scripts?: string | null;
  custom_body_scripts?: string | null;
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["site_settings"],
      queryFn: async () => {
        const { data } = await supabase
          .from("site_settings")
          .select("*")
          .limit(1)
          .maybeSingle();
        return data;
      },
      staleTime: 10 * 60 * 1000,
    });
  },
  head: ({ loaderData }) => {
    const s = (loaderData ?? null) as SiteSettings | null;
    const title = s?.meta_title || `${s?.site_name ?? "Nexio"} — Premium Tech Store, Bangladesh`;
    const description =
      s?.meta_description ||
      "Smartphones, laptops, tablets & accessories. 0% EMI across Bangladesh.";
    const meta: Array<Record<string, string>> = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: s?.site_name ?? "Nexio" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "theme-color", content: "#0f766e" },
    ];
    if (s?.meta_keywords) meta.push({ name: "keywords", content: s.meta_keywords });
    if (s?.og_image_url) {
      meta.push({ property: "og:image", content: s.og_image_url });
      meta.push({ name: "twitter:image", content: s.og_image_url });
    }
    if (s?.gsc_verification) {
      meta.push({ name: "google-site-verification", content: s.gsc_verification });
    }
    const links: Array<Record<string, string>> = [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", href: s?.favicon_url || "/favicon.ico" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ];

    const scripts: Array<Record<string, string>> = [];

    // Google Tag Manager
    if (s?.gtm_id) {
      scripts.push({
        children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${s.gtm_id}');`,
      });
    }

    // GA4 / Google Ads (gtag.js)
    const gtagId = s?.ga_measurement_id || s?.google_ads_id;
    if (gtagId) {
      scripts.push({ src: `https://www.googletagmanager.com/gtag/js?id=${gtagId}`, async: "true" });
      const configLines: string[] = [];
      if (s?.ga_measurement_id) configLines.push(`gtag('config', '${s.ga_measurement_id}');`);
      if (s?.google_ads_id) configLines.push(`gtag('config', '${s.google_ads_id}');`);
      scripts.push({
        children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${configLines.join("")}`,
      });
    }

    // Facebook / Meta Pixel
    if (s?.fb_pixel_id) {
      scripts.push({
        children: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${s.fb_pixel_id}');fbq('track','PageView');`,
      });
    }

    // TikTok Pixel
    if (s?.tiktok_pixel_id) {
      scripts.push({
        children: `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${s.tiktok_pixel_id}');ttq.page();}(window, document, 'ttq');`,
      });
    }

    // Snapchat Pixel
    if (s?.snapchat_pixel_id) {
      scripts.push({
        children: `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${s.snapchat_pixel_id}');snaptr('track','PAGE_VIEW');`,
      });
    }

    // Pinterest Tag
    if (s?.pinterest_tag_id) {
      scripts.push({
        children: `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");pintrk('load','${s.pinterest_tag_id}');pintrk('page');`,
      });
    }

    // Twitter / X Pixel
    if (s?.twitter_pixel_id) {
      scripts.push({
        children: `!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments)},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');twq('config','${s.twitter_pixel_id}');`,
      });
    }

    // LinkedIn Insight Tag
    if (s?.linkedin_partner_id) {
      scripts.push({
        children: `_linkedin_partner_id="${s.linkedin_partner_id}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);`,
      });
    }

    // Hotjar
    if (s?.hotjar_id) {
      scripts.push({
        children: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${s.hotjar_id},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r)})(window,document,'https://static.hotjar.com/c/hotjar-',  '.js?sv=');`,
      });
    }

    // Microsoft Clarity
    if (s?.clarity_id) {
      scripts.push({
        children: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${s.clarity_id}");`,
      });
    }

    return { meta, links, scripts };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});


function RootShell({ children }: { children: React.ReactNode }) {
  const s = (Route.useLoaderData() ?? null) as SiteSettings | null;
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {s?.custom_head_scripts ? (
          <script dangerouslySetInnerHTML={{ __html: s.custom_head_scripts }} />
        ) : null}
      </head>
      <body>
        {/* GTM noscript */}
        {s?.gtm_id ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${s.gtm_id}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
        {/* Facebook Pixel noscript */}
        {s?.fb_pixel_id ? (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${s.fb_pixel_id}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        ) : null}
        {children}
        {s?.custom_body_scripts ? (
          <div dangerouslySetInnerHTML={{ __html: s.custom_body_scripts }} />
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const settings = Route.useLoaderData() as { auto_image_optimization?: boolean; image_quality?: number } | null;

  useEffect(() => {
    setProxyOptions({
      enabled: settings?.auto_image_optimization !== false,
      quality: typeof settings?.image_quality === "number" ? settings.image_quality : 78,
    });
  }, [settings?.auto_image_optimization, settings?.image_quality]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        
        <Outlet />
        <CartDrawer />
        <InstallAppPrompt
          siteName={(Route.useLoaderData() as { site_name?: string | null } | null)?.site_name}
          logoUrl={(Route.useLoaderData() as { logo_url?: string | null } | null)?.logo_url}
          faviconUrl={(Route.useLoaderData() as { favicon_url?: string | null } | null)?.favicon_url}
        />
        <Toaster richColors position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
