import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = [
  "Planners",
  "Resumes",
  "Art Prints",
  "Guides",
  "Templates",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  pdf_url: string | null;
  created_at: string;
};

export type ProductWithPreview = Product & { preview_url: string | null };

const IMAGE_BUCKET = "product-images";
const FILE_BUCKET = "product-files";

/** Cover images live in a private bucket, so storage paths need signed URLs. */
async function resolveImageUrls(products: Product[]): Promise<ProductWithPreview[]> {
  const paths = products
    .map((p) => p.image_url)
    .filter((url): url is string => !!url && !url.startsWith("http"));

  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await supabase.storage
      .from(IMAGE_BUCKET)
      .createSignedUrls(paths, 60 * 60);
    data?.forEach((entry) => {
      if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
    });
  }

  return products.map((p) => ({
    ...p,
    preview_url: !p.image_url
      ? null
      : p.image_url.startsWith("http")
        ? p.image_url
        : (signed.get(p.image_url) ?? null),
  }));
}

export async function fetchProducts(): Promise<ProductWithPreview[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return resolveImageUrls((data ?? []) as Product[]);
}

export async function getDownloadUrl(pdfPath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(FILE_BUCKET)
    .createSignedUrl(pdfPath, 60 * 5, { download: true });
  if (error) throw error;
  return data.signedUrl;
}

function safeName(name: string) {
  return `${crypto.randomUUID()}-${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

export async function uploadFile(
  bucket: "product-images" | "product-files",
  file: File,
): Promise<string> {
  const path = safeName(file.name);
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export type ProductInput = {
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  pdf_url: string | null;
};

export async function createProduct(input: ProductInput) {
  const { error } = await supabase.from("products").insert(input);
  if (error) throw error;
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const { error } = await supabase.from("products").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
