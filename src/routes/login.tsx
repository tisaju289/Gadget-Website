import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/lib/useSiteSettings";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Nexio" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const siteName = settings?.site_name ?? "Nexio";
  const logoUrl = settings?.logo_url;
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Welcome back!");
        // Check admin role to decide redirect target
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: role } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();
          navigate({ to: role ? "/admin" : "/" });
        } else {
          navigate({ to: "/" });
        }
      } else {
        await signUp(email, password, name);
        toast.success("Account created! You can now log in.");
        setMode("login");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <Link to="/" className="flex items-center justify-center gap-2 text-3xl font-extrabold">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 w-auto" />
          ) : null}
          <span>{siteName}</span>
        </Link>
        <h1 className="mt-6 text-center text-xl font-semibold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Sign in to continue" : "Join Nexio today"}
        </p>

        <div className="mt-6 flex gap-2 rounded-lg bg-secondary p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-sale text-sale" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-foreground">
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
