// Image proxy helper.
// Facebook CDN (fbcdn.net) images are hotlink-protected and short-lived (oe= expiry).
// We route external images through wsrv.nl which fetches, caches, optimizes to WebP,
// and serves them reliably with proper CORS/no referer issues. This also makes the
// site significantly faster on mobile by shrinking payload size.

type ProxyOptions = { enabled: boolean; quality: number };

// Defaults — overridden at runtime from site_settings via setProxyOptions().
const opts: ProxyOptions = { enabled: true, quality: 78 };

export function setProxyOptions(next: Partial<ProxyOptions>) {
  if (typeof next.enabled === "boolean") opts.enabled = next.enabled;
  if (typeof next.quality === "number" && next.quality >= 30 && next.quality <= 95) {
    opts.quality = Math.round(next.quality);
  }
}

export function proxyImg(url?: string | null, w: number = 600): string {
  if (!url) return "";
  // Skip local/data/already-proxied URLs
  if (
    url.startsWith("/") ||
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    url.includes("wsrv.nl") ||
    url.includes("/src/assets/") ||
    url.includes("/assets/")
  ) {
    return url;
  }
  if (!opts.enabled) return url;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return url;
    // dpr-aware (mobile retina) — cap at 2x to keep payload small
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const width = Math.round(w * dpr);
    return `https://wsrv.nl/?url=${encodeURIComponent(u.toString())}&w=${width}&output=webp&q=${opts.quality}&we&il`;
  } catch {
    return url;
  }
}

// Build a srcset for responsive images. Returns "" if URL is local/data.
export function proxySrcSet(url?: string | null, widths: number[] = [400, 800, 1200]): string {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:") || url.includes("/src/assets/")) return "";
  return widths.map((w) => `${proxyImg(url, w)} ${w}w`).join(", ");
}
