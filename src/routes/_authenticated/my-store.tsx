import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, getDownloadUrl } from "@/lib/products";
import { fetchMyPurchases } from "@/lib/purchases";

const TITLE = "My Store — Your PaperShop library";
const DESCRIPTION = "Every product you've bought, ready to download whenever you want.";

export const Route = createFileRoute("/_authenticated/my-store")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyStore,
});

function MyStore() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: purchases, isLoading, error } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: fetchMyPurchases,
  });

  async function handleDownload(purchaseId: string, pdfPath: string | null) {
    if (!pdfPath) {
      toast.error("This product's file isn't attached yet.");
      return;
    }
    setDownloading(purchaseId);
    try {
      const url = await getDownloadUrl(pdfPath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("We couldn't prepare that download. Please try again.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Badge variant="secondary" className="gap-1.5">
            <ShoppingBag className="size-3.5" />
            My Store
          </Badge>
          <h1 className="mt-3 text-3xl md:text-4xl">Your library</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Products you've bought live here — download them again anytime, free.
          </p>
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            We couldn't load your library right now. Please refresh and try again.
          </p>
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (purchases?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-lg">Nothing in your store yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Buy something from the marketplace and it will appear here.
            </p>
            <Button asChild className="mt-5">
              <Link to="/">Browse the marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {purchases?.map((purchase) => (
              <article
                key={purchase.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {purchase.product?.category ?? "Product"}
                  </p>
                  <h2 className="truncate text-lg">{purchase.product?.title ?? "Product"}</h2>
                  <p className="text-sm text-muted-foreground">
                    Bought for {formatPrice(purchase.amount)} on{" "}
                    {new Date(purchase.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  onClick={() => handleDownload(purchase.id, purchase.product?.pdf_url ?? null)}
                  disabled={downloading === purchase.id}
                >
                  {downloading === purchase.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Download
                </Button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
