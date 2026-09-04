import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { BRAND_LOGO_URL, BRAND_NAME } from "@/lib/brand";

type Props = {
  query?: string;
  onQueryChange?: (value: string) => void;
};

export function SiteHeader({ query, onQueryChange }: Props) {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setSignedIn(Boolean(data.user));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("तुम्ही साइन आउट केले आहे.");
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:gap-6">
        <Link to="/" className="flex items-center gap-3 font-display text-xl">
          <span className="flex size-11 items-center justify-center overflow-hidden rounded-full border border-border bg-card shadow-card">
            <img src={BRAND_LOGO_URL} alt={`${BRAND_NAME} लोगो`} className="size-full object-cover" />
          </span>
          <span>
            Smart<span className="text-primary"> Ness</span>
          </span>
        </Link>

        {onQueryChange ? (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query ?? ""}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="शोधा…"
              autoComplete="off"
              className="pl-9"
              aria-label="उत्पादने शोधा"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <nav className="flex flex-wrap items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            बाजार
          </Link>
          <Link
            to="/my-store"
            className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            माझे स्टोअर
          </Link>
          {signedIn ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="size-4" />
              बाहेर पडा
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">
                <LogIn className="size-4" />
                लॉगिन
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
