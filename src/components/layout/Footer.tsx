import { Facebook, Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Branch = { name: string; addr: string; phone: string };

const defaultBranches: Branch[] = [
  { name: "Dhanmondi Branch", addr: "House 12, Road 5, Dhanmondi, Dhaka-1205", phone: "+880 1700-111111" },
  { name: "Gulshan Branch", addr: "Plot 22, Gulshan-1, Dhaka-1212", phone: "+880 1700-222222" },
  { name: "Chittagong Branch", addr: "GEC Mor, Panchlaish, Chittagong", phone: "+880 1700-333333" },
  { name: "Sylhet Branch", addr: "Zindabazar, Sylhet-3100", phone: "+880 1700-444444" },
];

export function Footer() {
  const { data } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  const siteName = data?.site_name ?? "Nexio";
  const tagline = data?.footer_tagline ?? "Bangladesh's premium tech destination. Authentic gadgets with the best after-sales service.";
  const email = data?.footer_email ?? "support@nexio.com.bd";
  const copyright = data?.footer_copyright ?? `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const socials = [
    { I: Facebook, href: data?.footer_facebook },
    { I: Instagram, href: data?.footer_instagram },
    { I: Linkedin, href: data?.footer_linkedin },
    { I: Youtube, href: data?.footer_youtube },
  ].filter(s => s.href || true); // always render, fallback "#"

  const branchesRaw = Array.isArray(data?.footer_branches) && data!.footer_branches.length > 0
    ? (data!.footer_branches as unknown as Branch[])
    : defaultBranches;

  const showSocials = data?.show_footer_socials !== false;
  const showCompany = data?.show_footer_company !== false;
  const showHelp = data?.show_footer_help !== false;
  const showTerms = data?.show_footer_terms !== false;
  const showBranches = data?.show_footer_branches !== false;

  return (
    <footer className="mt-10 border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 text-center md:grid-cols-4 md:text-left">
          <div>
            <a href="/" className="flex items-center justify-center gap-1 text-2xl font-extrabold md:justify-start">
              <span>{siteName}</span>
            </a>
            <p className="mt-3 text-sm opacity-70">{tagline}</p>
            {showSocials && (
              <div className="mt-4 flex justify-center gap-2 md:justify-start">
                {socials.map(({ I, href }, i) => (
                  <a key={i} href={href || "#"} target={href ? "_blank" : undefined} rel="noreferrer" className="rounded-full border border-white/20 p-2 transition-colors hover:bg-sale hover:border-neon">
                    <I className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {showCompany && (
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:text-neon">About Us</a></li>
                <li><a href="#" className="hover:text-neon">Career</a></li>
                <li><a href="#" className="hover:text-neon">Brands</a></li>
                <li><a href="#" className="hover:text-neon">Blogs</a></li>
                <li><a href="#" className="hover:text-neon">Order Tracking</a></li>
              </ul>
            </div>
          )}

          {showHelp && (
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">Help Center</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:text-neon">FAQ</a></li>
                <li><a href="#" className="hover:text-neon">Support</a></li>
                <li><a href="#" className="hover:text-neon">Feedback</a></li>
                <li><a href="#" className="hover:text-neon">Contact</a></li>
              </ul>
            </div>
          )}

          {showTerms && (
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">Terms & Conditions</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li><a href="#" className="hover:text-neon">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-neon">Refund Policy</a></li>
                <li><a href="#" className="hover:text-neon">Warranty Policy</a></li>
                <li><a href="#" className="hover:text-neon">EMI Policy</a></li>
              </ul>
            </div>
          )}
        </div>

        {showBranches && branchesRaw.length > 0 && (
          <div className="mt-12 border-t border-white/10 pt-8 text-center md:text-left">
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider">Our Branches</h4>
            <div className="grid gap-5 md:grid-cols-4">
              {branchesRaw.map((b, i) => (
                <div key={i} className="rounded-lg border border-white/10 p-4 text-sm">
                  <p className="mb-2 font-semibold">{b.name}</p>
                  <p className="flex items-start justify-center gap-1.5 opacity-80 md:justify-start">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sale" />
                    {b.addr}
                  </p>
                  {b.phone && (
                    <p className="mt-1 flex items-center justify-center gap-1.5 opacity-80 md:justify-start">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-sale" />
                      {b.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs opacity-70 md:flex-row">
          <p>{copyright}</p>
          <p className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> {email}
          </p>
        </div>
      </div>
      <div className="h-16 md:hidden" />
    </footer>
  );
}
