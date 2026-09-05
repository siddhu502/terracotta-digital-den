import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DownloadRow = {
  id: string;
  email: string | null;
  product_title: string;
  buyer_name: string;
  created_at: string;
};

export type PurchaseRow = {
  id: string;
  email: string | null;
  product_title: string;
  buyer_name: string | null;
  amount: number;
  created_at: string;
};

/** Admin-only: every download and purchase with the buyer's email and watermark name. */
export const getAdminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not allowed.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: downloads }, { data: purchases }] = await Promise.all([
      supabaseAdmin
        .from("downloads")
        .select("id, email, product_title, buyer_name, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin
        .from("purchases")
        .select("id, user_id, buyer_name, amount, created_at, product:products(title)")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    // Resolve emails for purchases (downloads already store them).
    const userIds = Array.from(new Set((purchases ?? []).map((p) => p.user_id as string)));
    const emails = new Map<string, string | null>();
    await Promise.all(
      userIds.map(async (id) => {
        const { data } = await supabaseAdmin.auth.admin.getUserById(id);
        emails.set(id, data.user?.email ?? null);
      }),
    );

    return {
      downloads: (downloads ?? []) as DownloadRow[],
      purchases: (purchases ?? []).map((p) => ({
        id: p.id as string,
        email: emails.get(p.user_id as string) ?? null,
        product_title: (p.product as { title: string } | null)?.title ?? "—",
        buyer_name: p.buyer_name as string | null,
        amount: Number(p.amount),
        created_at: p.created_at as string,
      })) as PurchaseRow[],
    };
  });
