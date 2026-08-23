import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, ImageIcon, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
import {
  CATEGORIES,
  createProduct,
  deleteProduct,
  fetchProducts,
  formatPrice,
  updateProduct,
  uploadFile,
  type ProductWithPreview,
} from "@/lib/products";

const TITLE = "Creator Dashboard — PaperShop Admin Portal";
const DESCRIPTION =
  "Upload cover mockups and PDF files, set pricing, and manage your digital product inventory on PaperShop.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
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

const EMPTY: FormState = { title: "", category: "", price: "", description: "" };

function AdminPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState<ProductWithPreview | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  function resetForm() {
    setForm(EMPTY);
    setEditing(null);
    setImageFile(null);
    setPdfFile(null);
    setImagePreview(null);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const save = useMutation({
    mutationFn: async () => {
      const price = Number(form.price);
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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
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
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-7"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="14.00"
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
