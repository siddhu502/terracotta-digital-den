import { supabase } from "@/integrations/supabase/client";

import type { Product } from "./products";

export type Purchase = {
  id: string;
  product_id: string;
  amount: number;
  created_at: string;
  product: Product | null;
};

export async function fetchMyPurchases(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("purchases")
    .select("id, product_id, amount, created_at, product:products(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Purchase[];
}

export async function fetchMyPurchasedProductIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from("purchases").select("product_id");
  if (error) return new Set();
  return new Set((data ?? []).map((row) => row.product_id as string));
}
