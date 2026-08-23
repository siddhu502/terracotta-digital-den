import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CATEGORIES,
  fetchProducts,
  formatPrice,
  getDownloadUrl,
  type ProductWithPreview,
} from "@/lib/products";

const TITLE = "PaperShop — Instant-download digital PDFs from independent makers";
const DESCRIPTION =
  "Browse planners, resume kits, art prints, guides and templates. Every product is a PDF you download the moment you buy.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selected, setSelected] = useState<ProductWithPreview | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [data, query, category]);

  return (
    <div className="min-h-screen">
      <SiteHeader query={query} onQueryChange={setQuery} />

      <section className="bg-hero-wash border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Sparkles className="size-3.5" />
            Handmade PDFs, delivered instantly
          </Badge>
          <h1 className="max-w-2xl text-4xl leading-tight md:text-6xl">
            A small shop for beautifully made digital paper goods.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            {DESCRIPTION}
          </p>

          <div className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
            <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for today?"
              aria-label="Search the marketplace"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl">
            {category === "All" ? "All products" : category}
          </h2>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "item" : "items"}
          </p>
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            We couldn't load the shop right now. Please refresh and try again.
          </p>
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-4/3 w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-lg">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another search, or add products from the Admin Portal.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={() => setSelected(product)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/70 py-10">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
          PaperShop — every purchase is a digital download. No shipping, ever.
        </div>
      </footer>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ProductCard({
  product,
  onOpen,
}: {
  product: ProductWithPreview;
  onOpen: () => void;
}) {
  return (
    <article className="card-lift overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-4/3 overflow-hidden bg-secondary">
          {product.preview_url ? (
            <img
              src={product.preview_url}
              alt={`Cover mockup for ${product.title}`}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              No cover image
            </div>
          )}
          <Badge className="absolute left-3 top-3 gap-1 bg-primary text-primary-foreground">
            <Download className="size-3" />
            Instant Download
          </Badge>
        </div>
        <div className="space-y-1.5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {product.category}
          </p>
          <h3 className="text-lg leading-snug">{product.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <p className="pt-2 font-display text-xl">{formatPrice(product.price)}</p>
        </div>
      </button>
    </article>
  );
}

function ProductDialog({
  product,
  onClose,
}: {
  product: ProductWithPreview | null;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleBuy() {
    if (!product) return;
    if (!product.pdf_url) {
      toast.error("This product's file isn't attached yet.");
      return;
    }
    setBusy(true);
    try {
      const url = await getDownloadUrl(product.pdf_url);
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Your download is ready.");
    } catch {
      toast.error("We couldn't prepare that download. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        {product ? (
          <div className="grid md:grid-cols-2">
            <div className="aspect-4/3 bg-secondary md:aspect-auto md:h-full">
              {product.preview_url ? (
                <img
                  src={product.preview_url}
                  alt={`Cover mockup for ${product.title}`}
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <div className="p-6">
              <DialogHeader className="space-y-2 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {product.category}
                </p>
                <DialogTitle className="font-display text-2xl">{product.title}</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed">
                  {product.description}
                </DialogDescription>
              </DialogHeader>

              <p className="mt-5 font-display text-3xl">{formatPrice(product.price)}</p>

              <Button className="mt-5 w-full" size="lg" onClick={handleBuy} disabled={busy}>
                <Download className="size-4" />
                {product.pdf_url ? "Buy now & download" : "File coming soon"}
              </Button>

              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                Secure, time-limited download link
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
