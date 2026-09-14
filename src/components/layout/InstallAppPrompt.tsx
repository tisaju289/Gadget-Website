import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallAppPromptProps = {
  siteName?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
};

const DISMISS_KEY = "nexio-install-prompt-dismissed";
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallAppPrompt({ siteName, logoUrl, faviconUrl }: InstallAppPromptProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_FOR_MS) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setOpen(true);
    };
    const handleInstalled = () => setOpen(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    void navigator.serviceWorker?.register("/sw.js");

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  const install = async () => {
    if (!installEvent) return;
    setInstalling(true);
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setInstalling(false);
    setOpen(false);
  };

  if (!open || !installEvent) return null;
  const name = siteName?.trim() || "Nexio";
  const logo = logoUrl || faviconUrl || "/icon-192.svg";

  return (
    <div className="fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4 sm:bottom-6">
      <div className="relative flex w-full max-w-md items-center gap-4 rounded-2xl border border-primary/20 bg-background p-4 shadow-2xl ring-1 ring-black/5 animate-in slide-in-from-bottom-4 duration-300">
        <button type="button" onClick={dismiss} aria-label="Close install prompt" className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <img src={logo} alt="" className="h-14 w-14 shrink-0 rounded-xl border bg-white object-contain p-1" />
        <div className="min-w-0 flex-1 pr-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Install app</p>
          <p className="mt-1 truncate text-base font-bold text-foreground">{name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Quick access, smoother shopping experience</p>
        </div>
        <button type="button" onClick={() => void install()} disabled={installing} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
          <Download className="h-4 w-4" />
          {installing ? "Installing..." : "Install"}
        </button>
      </div>
    </div>
  );
}