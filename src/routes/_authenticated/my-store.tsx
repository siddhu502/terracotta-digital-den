import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Eye, Loader2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { NameDialog } from "@/components/name-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { BRAND_NAME } from "@/lib/brand";
import { buildPersonalizedPdf, downloadPersonalizedPdf } from "@/lib/download";
import { displayCategory, formatPrice } from "@/lib/products";
import { fetchMyPurchases, type Purchase } from "@/lib/purchases";

const TITLE = `माझे स्टोअर — ${BRAND_NAME} लायब्ररी`;
const DESCRIPTION = "तुम्ही खरेदी केलेली प्रत्येक PDF, कधीही मोफत डाउनलोड करण्यासाठी तयार.";

type Action = "download" | "open";

export const Route = createFileRoute("/_authenticated/my-store")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyStore,
});

function MyStore() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<Purchase | null>(null);
  const [action, setAction] = useState<Action>("download");
  const [askName, setAskName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);

  const { data: purchases, isLoading, error } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: fetchMyPurchases,
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  async function run(purchase: Purchase, kind: Action, name?: string) {
    setBusy(true);
    try {
      if (kind === "download") {
        await downloadPersonalizedPdf(purchase.product_id, name);
        toast.success("तुमची PDF डाउनलोड होत आहे.");
      } else {
        const { blob } = await buildPersonalizedPdf(purchase.product_id, name);
        setPreview({ url: URL.createObjectURL(blob), title: purchase.product?.title ?? "PDF" });
      }
      setAskName(false);
      setTarget(null);
      if (!purchase.buyer_name) queryClient.invalidateQueries({ queryKey: ["my-purchases"] });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("NAME_REQUIRED")) {
        setAskName(true);
      } else {
        toast.error(message || "PDF तयार करता आली नाही.");
      }
    } finally {
      setBusy(false);
    }
  }

  function start(purchase: Purchase, kind: Action) {
    if (!purchase.product?.pdf_url) {
      toast.error("या उत्पादनाची फाईल अजून जोडलेली नाही.");
      return;
    }
    setTarget(purchase);
    setAction(kind);
    if (purchase.buyer_name) {
      void run(purchase, kind);
    } else {
      setAskName(true);
    }
  }

  const isBusy = (p: Purchase) => busy && target?.id === p.id;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Badge variant="secondary" className="gap-1.5">
            <ShoppingBag className="size-3.5" />
            माझे स्टोअर
          </Badge>
          <h1 className="mt-3 text-3xl md:text-4xl">तुमची लायब्ररी</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            तुम्ही खरेदी केलेली उत्पादने इथे आहेत — ती कधीही, मोफत, पुन्हा डाउनलोड करा.
          </p>
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            तुमची लायब्ररी सध्या लोड होऊ शकली नाही. कृपया पान रिफ्रेश करा.
          </p>
        ) : isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (purchases?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-lg">तुमच्या स्टोअरमध्ये अजून काही नाही</p>
            <p className="mt-1 text-sm text-muted-foreground">
              बाजारातून काहीतरी खरेदी करा आणि ते इथे दिसेल.
            </p>
            <Button asChild className="mt-5">
              <Link to="/">बाजार पाहा</Link>
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
                    {displayCategory(purchase.product?.category ?? "उत्पादन")}
                  </p>
                  <h2 className="truncate text-lg">{purchase.product?.title ?? "उत्पादन"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(purchase.amount)} मध्ये खरेदी,{" "}
                    {new Date(purchase.created_at).toLocaleDateString("mr-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {purchase.buyer_name ? ` · नाव: ${purchase.buyer_name}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => start(purchase, "open")}
                    disabled={isBusy(purchase)}
                  >
                    {isBusy(purchase) && action === "open" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                    उघडा
                  </Button>
                  <Button onClick={() => start(purchase, "download")} disabled={isBusy(purchase)}>
                    {isBusy(purchase) && action === "download" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    डाउनलोड करा
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <NameDialog
        open={askName && !!target}
        busy={busy}
        confirmLabel={action === "open" ? "उघडा" : "डाउनलोड करा"}
        onConfirm={(name) => target && run(target, action, name)}
        onClose={() => {
          if (busy) return;
          setAskName(false);
          setTarget(null);
        }}
      />

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="h-[90vh] max-w-5xl p-4 sm:p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">{preview?.title}</DialogTitle>
            <DialogDescription>तुमच्या नावाच्या वॉटरमार्कसह PDF</DialogDescription>
          </DialogHeader>
          {preview ? (
            <iframe
              src={preview.url}
              title={preview.title}
              className="h-full w-full flex-1 rounded-lg border border-border bg-muted"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
