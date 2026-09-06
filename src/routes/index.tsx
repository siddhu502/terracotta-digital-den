import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { NameDialog } from "@/components/name-dialog";
import { SiteFooter } from "@/components/site-footer";
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
import { supabase } from "@/integrations/supabase/client";
import { BRAND_NAME } from "@/lib/brand";
import { fetchCategories } from "@/lib/categories";
import { downloadPersonalizedPdf } from "@/lib/download";
import {
  claimFreeProduct,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/lib/payments.functions";
import {
  displayCategory,
  fetchProducts,
  formatPrice,
  type ProductWithPreview,
} from "@/lib/products";
import { fetchMyPurchasedProductIds } from "@/lib/purchases";
import { loadRazorpay, type RazorpaySuccess } from "@/lib/razorpay-client";

const TITLE = "Smart Ness — त्वरित डाउनलोड होणारे डिजिटल PDF";
const DESCRIPTION =
  "प्लॅनर, रेझ्युमे किट, आर्ट प्रिंट, मार्गदर्शिका आणि टेम्पलेट्स. प्रत्येक PDF फक्त ₹49 — पेमेंट होताच तुमच्या नावासह डाउनलोड करा.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: owned } = useQuery({
    queryKey: ["my-purchased-ids"],
    queryFn: fetchMyPurchasedProductIds,
  });

  const categoryNames = useMemo(() => {
    const fromDb = (categories ?? []).map((c) => c.name);
    const fromProducts = (data ?? []).map((p) => p.category);
    return Array.from(new Set([...fromDb, ...fromProducts]));
  }, [categories, data]);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        displayCategory(p.category).includes(q);
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
            प्रत्येक PDF फक्त {formatPrice(49)}
          </Badge>
          <h1 className="max-w-2xl text-4xl leading-tight md:text-6xl">{BRAND_NAME}</h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">{DESCRIPTION}</p>

          <div className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
            <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="शोधा…"
              aria-label="बाजारात शोधा"
              autoComplete="off"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["All", ...categoryNames].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {c === "All" ? "सर्व" : displayCategory(c)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl">{category === "All" ? "सर्व उत्पादने" : displayCategory(category)}</h2>
          <p className="text-sm text-muted-foreground">{products.length} वस्तू</p>
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            दुकान सध्या लोड होऊ शकले नाही. कृपया पान रिफ्रेश करून पुन्हा प्रयत्न करा.
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
            <p className="font-display text-lg">इथे अजून काही नाही</p>
            <p className="mt-1 text-sm text-muted-foreground">
              दुसरे काही शोधा, किंवा नवीन उत्पादने जोडा.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                owned={owned?.has(product.id) ?? false}
                onOpen={() => setSelected(product)}
              />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />

      <ProductDialog
        product={selected}
        owned={selected ? (owned?.has(selected.id) ?? false) : false}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function ProductCard({
  product,
  owned,
  onOpen,
}: {
  product: ProductWithPreview;
  owned: boolean;
  onOpen: () => void;
}) {
  return (
    <article className="card-lift overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <button onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-4/3 overflow-hidden bg-secondary">
          {product.preview_url ? (
            <img
              src={product.preview_url}
              alt={`${product.title} चे मुखपृष्ठ`}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              मुखपृष्ठ चित्र नाही
            </div>
          )}
          <Badge className="absolute left-3 top-3 gap-1 bg-primary text-primary-foreground">
            <Download className="size-3" />
            {owned ? "खरेदी केलेले" : "त्वरित डाउनलोड"}
          </Badge>
        </div>
        <div className="space-y-1.5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {displayCategory(product.category)}
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
  owned,
  onClose,
}: {
  product: ProductWithPreview | null;
  owned: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createOrder = useServerFn(createRazorpayOrder);
  const verifyPayment = useServerFn(verifyRazorpayPayment);
  const claimFree = useServerFn(claimFreeProduct);
  const [busy, setBusy] = useState(false);
  const [askName, setAskName] = useState(false);
  // While Razorpay's own window is open, keep our dialogs closed so their
  // focus trap / pointer-events lock doesn't block clicks inside Razorpay.
  const [paying, setPaying] = useState(false);

  async function handleBuyClick() {
    if (!product) return;
    if (!product.pdf_url) {
      toast.error("या उत्पादनाची फाईल अजून जोडलेली नाही.");
      return;
    }
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      toast.info("खरेदी करण्यासाठी आधी लॉगिन करा.");
      navigate({ to: "/auth", search: { redirect: "/" } });
      return;
    }
    setAskName(true);
  }

  async function deliver(productId: string, name: string) {
    try {
      await downloadPersonalizedPdf(productId, name);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-purchased-ids"] }),
        queryClient.invalidateQueries({ queryKey: ["my-purchases"] }),
      ]);
      toast.success("तुमची PDF तयार आहे — ती 'माझे स्टोअर' मध्येही सापडेल.");
      setAskName(false);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleNameConfirmed(name: string) {
    if (!product) return;
    setBusy(true);
    try {
      if (product.price === 0 && !owned) {
        await claimFree({ data: { productId: product.id } });
        await deliver(product.id, name);
        return;
      }

      const order = await createOrder({ data: { productId: product.id } });
      if (order.alreadyOwned) {
        await deliver(product.id, name);
        return;
      }

      await loadRazorpay();
      if (!window.Razorpay) throw new Error("पेमेंट विंडो उघडता आली नाही.");
      const { data: userData } = await supabase.auth.getUser();

      const productId = product.id;
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: BRAND_NAME,
        description: order.productTitle,
        order_id: order.orderId,
        prefill: userData.user?.email ? { email: userData.user.email } : {},
        handler: (response: RazorpaySuccess) => {
          void (async () => {
            try {
              await verifyPayment({
                data: {
                  productId,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                },
              });
              await deliver(productId, name);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "पेमेंट पडताळणी अयशस्वी.");
            } finally {
              setBusy(false);
            }
          })();
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            toast.info("पेमेंट रद्द केले.");
          },
        },
      });
      rzp.open();
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error ? err.message : "पेमेंट सुरू करता आले नाही.");
    }
  }

  return (
    <>
      <Dialog open={!!product && !askName} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {product ? (
            <div className="grid md:grid-cols-2">
              <div className="aspect-4/3 bg-secondary md:aspect-auto md:h-full">
                {product.preview_url ? (
                  <img
                    src={product.preview_url}
                    alt={`${product.title} चे मुखपृष्ठ`}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-6">
                <DialogHeader className="space-y-2 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {displayCategory(product.category)}
                  </p>
                  <DialogTitle className="font-display text-2xl">{product.title}</DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    {product.description}
                  </DialogDescription>
                </DialogHeader>

                <p className="mt-5 font-display text-3xl">{formatPrice(product.price)}</p>

                <Button className="mt-5 w-full" size="lg" onClick={handleBuyClick} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  {!product.pdf_url
                    ? "फाईल लवकरच येत आहे"
                    : owned
                      ? "पुन्हा डाउनलोड करा (मोफत)"
                      : product.price === 0
                        ? "मोफत डाउनलोड करा"
                        : "पैसे भरा आणि डाउनलोड करा"}
                </Button>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  {product.price === 0
                    ? "मोफत PDF · PDF वर तुमचे नाव छापले जाते"
                    : "Razorpay द्वारे सुरक्षित पेमेंट · PDF वर तुमचे नाव छापले जाते"}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <NameDialog
        open={askName}
        busy={busy}
        confirmLabel={
          owned ? "डाउनलोड करा" : product?.price === 0 ? "मोफत डाउनलोड करा" : "पैसे भरा आणि डाउनलोड करा"
        }
        onConfirm={handleNameConfirmed}
        onClose={() => {
          setAskName(false);
        }}
      />
    </>
  );
}
