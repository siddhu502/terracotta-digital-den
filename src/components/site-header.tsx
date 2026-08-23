import { Link } from "@tanstack/react-router";
import { Search, FileDown } from "lucide-react";

import { Input } from "@/components/ui/input";

type Props = {
  query?: string;
  onQueryChange?: (value: string) => void;
};

export function SiteHeader({ query, onQueryChange }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:gap-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileDown className="size-4" />
          </span>
          <span>
            Paper<span className="text-primary">Shop</span>
          </span>
        </Link>

        {onQueryChange ? (
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query ?? ""}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search planners, resumes, art prints…"
              className="pl-9"
              aria-label="Search products"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            Marketplace
          </Link>
          <Link
            to="/admin"
            className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            Admin Portal
          </Link>
        </nav>
      </div>
    </header>
  );
}
