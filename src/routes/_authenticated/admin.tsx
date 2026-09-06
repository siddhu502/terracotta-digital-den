import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  Download,
  FileText,
  ImageIcon,
  IndianRupee,
  Loader2,
  Package,
  Pencil,
  Plus,
  Tags,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { getAdminAnalytics } from "@/lib/analytics.functions";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { createCategory, deleteCategory, fetchCategories } from "@/lib/categories";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  formatPrice,
  updateProduct,
  uploadFile,
  type ProductWithPreview,
} from "@/lib/products";

const TITLE = "उत्पादन व्यवस्थापन — Smart Ness";
const DESCRIPTION =
  "Smart Ness वरील PDF, श्रेणी, फाईल आणि किंमत व्यवस्थापित करा.";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user?.email?.toLowerCase() !== "goldsmith.sir@gmail.com") {
      throw redirect({ to: "/" });
    }
    const { error } = await supabase.from("user_roles").insert({
      user_id: data.user.id,
      role: "admin",
    });
    if (error && error.code !== "23505") throw redirect({ to: "/" });
  },
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
  component: AdminPage,
});

type FormState = {
  title: string;
  category: string;
  price: string;
  description: string;
};

const EMPTY: FormState = { title: "", category: "", price: "49", description: "" };

function AdminPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState<ProductWithPreview | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [pricing, setPricing] = useState<"free" | "paid">("paid");
  const [tab, setTab] = useState<"inventory" | "analytics">("inventory");
  const imageRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  function resetForm() {
    setForm(EMPTY);
    setEditing(null);
    setImageFile(null);
    setPdfFile(null);
    setImagePreview(null);
    setPricing("paid");
    if (imageRef.current) imageRef.current.value = "";
    if (pdfRef.current) pdfRef.current.value = "";
  }

  function startEdit(product: ProductWithPreview) {
    setEditing(product);
    setForm({
      title: product.title,
      category: product.category,
      price: String(product.price),
      description: product.description,
    });
    setImageFile(null);
    setPdfFile(null);
    setImagePreview(product.preview_url);
    setPricing(product.price === 0 ? "free" : "paid");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const save = useMutation({
    mutationFn: async () => {
      const price = pricing === "free" ? 0 : Number(form.price);
      if (!form.title.trim()) throw new Error("Please add a product title.");
      if (!form.category) throw new Error("Please pick a category.");
      if (!Number.isFinite(price) || price < 0) throw new Error("Please enter a valid price.");

      const image_url = imageFile ? await uploadFile("product-images", imageFile) : null;
      const pdf_url = pdfFile ? await uploadFile("product-files", pdfFile) : null;

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        category: form.category,
        image_url,
        pdf_url,
      };

      if (editing) {
        await updateProduct(editing.id, {
          ...payload,
          image_url: image_url ?? editing.image_url,
          pdf_url: pdf_url ?? editing.pdf_url,
        });
      } else {
        await createProduct(payload);
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Product updated." : "Product published to the marketplace.");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: Error) => toast.error(err.message || "Something went wrong."),
  });

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted.");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Couldn't delete that product."),
  });

  const addCategory = useMutation({
    mutationFn: () => createCategory(newCategory),
    onSuccess: () => {
      toast.success("Category added.");
      setNewCategory("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't add that category."),
  });

  const removeCategory = useMutation({
    mutationFn: async (id: string) => {
      const category = categories?.find((c) => c.id === id);
      const inUse = (products ?? []).some((p) => p.category === category?.name);
      if (inUse) {
        throw new Error(`"${category?.name}" is used by existing products. Reassign them first.`);
      }
      await deleteCategory(id);
    },
    onSuccess: () => {
      toast.success("Category deleted.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: Error) => toast.error(err.message || "Couldn't delete that category."),
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Badge variant="secondary">Creator Dashboard</Badge>
          <h1 className="mt-3 text-3xl md:text-4xl">Manage your digital inventory</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Anything you publish here appears on the marketplace instantly.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1 sm:max-w-sm">
          <Button variant={tab === "inventory" ? "default" : "ghost"} onClick={() => setTab("inventory")}>
            <Package className="size-4" />
            Inventory
          </Button>
          <Button variant={tab === "analytics" ? "default" : "ghost"} onClick={() => setTab("analytics")}>
            <BarChart3 className="size-4" />
            Analytics
          </Button>
        </div>

        {tab === "analytics" ? <AnalyticsPanel /> : null}

        <div className={tab === "inventory" ? "grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]" : "hidden"}>
          <div className="space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl">{editing ? "Edit product" : "New product"}</h2>
                {editing ? (
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="size-4" />
                    Cancel
                  </Button>
                ) : null}
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  save.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Product title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="2026 Minimal Life Planner"
                  />
                </div>

                <div className="space-y-2">
                  <Label>किंमत प्रकार</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
                    <Button
                      type="button"
                      variant={pricing === "free" ? "default" : "ghost"}
                      onClick={() => setPricing("free")}
                    >
                      मोफत
                    </Button>
                    <Button
                      type="button"
                      variant={pricing === "paid" ? "default" : "ghost"}
                      onClick={() => setPricing("paid")}
                    >
                      सशुल्क
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(value) => setForm({ ...form, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Choose" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories ?? []).map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (INR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="1"
                        className="pl-7"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="49"
                        disabled={pricing === "free"}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What's included, page count, print sizes…"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover">Cover image (JPG / PNG)</Label>
                  <Input
                    id="cover"
                    ref={imageRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setImageFile(file);
                      setImagePreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="mt-2 aspect-4/3 w-full rounded-xl border border-border object-cover"
                    />
                  ) : (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ImageIcon className="size-3.5" />
                      Shown as the product thumbnail.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf">Digital product file (PDF)</Label>
                  <Input
                    id="pdf"
                    ref={pdfRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="size-3.5" />
                    {pdfFile
                      ? pdfFile.name
                      : editing?.pdf_url
                        ? "Existing file kept unless you choose a new one."
                        : "Delivered through a secure, expiring link."}
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={save.isPending}>
                  {save.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {editing ? "Save changes" : "Publish product"}
                </Button>
              </form>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-1 flex items-center gap-2 text-xl">
                <Tags className="size-5" />
                Categories
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Categories in use by a product can't be deleted.
              </p>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addCategory.mutate();
                }}
              >
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Wedding Invites"
                  aria-label="New category name"
                />
                <Button type="submit" disabled={addCategory.isPending || !newCategory.trim()}>
                  {addCategory.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  Add
                </Button>
              </form>
              <ul className="mt-4 space-y-2">
                {(categories ?? []).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span>{c.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategory.mutate(c.id)}
                      disabled={removeCategory.isPending}
                      aria-label={`Delete category ${c.name}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </li>
                ))}
                {(categories?.length ?? 0) === 0 ? (
                  <li className="text-sm text-muted-foreground">No categories yet.</li>
                ) : null}
              </ul>
            </section>
          </div>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-5 text-xl">Inventory</h2>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading inventory…</p>
            ) : (products?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products yet — publish your first one on the left.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell className="text-muted-foreground">{p.category}</TableCell>
                        <TableCell>{formatPrice(p.price)}</TableCell>
                        <TableCell>
                          {p.pdf_url ? (
                            <Badge variant="secondary">PDF</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Missing</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remove.mutate(p.id)}
                            disabled={remove.isPending}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function AnalyticsPanel() {
  const fetchAnalytics = useServerFn(getAdminAnalytics);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => fetchAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> लोड होत आहे…
      </div>
    );
  }
  if (error || !data) {
    return <p className="text-sm text-destructive">विश्लेषण लोड होऊ शकले नाही.</p>;
  }

  const revenue = data.purchases.reduce((sum, p) => sum + p.amount, 0);
  const buyers = new Set(data.purchases.map((p) => p.email ?? p.id)).size;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("mr-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Download, label: "एकूण डाउनलोड", value: String(data.downloads.length) },
          { icon: Users, label: "खरेदीदार", value: String(buyers) },
          { icon: IndianRupee, label: "एकूण उत्पन्न", value: formatPrice(revenue) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Icon className="size-4 text-primary" /> {label}
            </p>
            <p className="mt-2 font-display text-2xl">{value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-xl">डाउनलोड</h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>केव्हा</TableHead>
                <TableHead>ईमेल</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead>वॉटरमार्क / शीर्षक नाव</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.downloads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    अजून कोणी डाउनलोड केलेले नाही.
                  </TableCell>
                </TableRow>
              ) : (
                data.downloads.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap">{fmtDate(d.created_at)}</TableCell>
                    <TableCell>{d.email ?? "—"}</TableCell>
                    <TableCell>{d.product_title}</TableCell>
                    <TableCell>{d.buyer_name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl">खरेदी</h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>केव्हा</TableHead>
                <TableHead>ईमेल</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead>नाव</TableHead>
                <TableHead className="text-right">रक्कम</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    अजून खरेदी झालेली नाही.
                  </TableCell>
                </TableRow>
              ) : (
                data.purchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-nowrap">{fmtDate(p.created_at)}</TableCell>
                    <TableCell>{p.email ?? "—"}</TableCell>
                    <TableCell>{p.product_title}</TableCell>
                    <TableCell>{p.buyer_name ?? "—"}</TableCell>
                    <TableCell className="text-right">{formatPrice(p.amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
