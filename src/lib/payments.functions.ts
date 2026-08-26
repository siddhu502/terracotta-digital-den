import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ productId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) throw new Error("Payment gateway is not configured.");

    const { data: product, error } = await context.supabase
      .from("products")
      .select("id, title, price, pdf_url")
      .eq("id", data.productId)
      .single();
    if (error || !product) throw new Error("Product not found.");
    if (!product.pdf_url) throw new Error("This product's file isn't attached yet.");

    const { data: existing } = await context.supabase
      .from("purchases")
      .select("id")
      .eq("user_id", context.userId)
      .eq("product_id", product.id)
      .maybeSingle();
    if (existing) return { alreadyOwned: true as const };

    const amount = Math.round(Number(product.price) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("This product has an invalid price.");
    }

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `ps_${product.id.slice(0, 8)}_${Date.now()}`,
      }),
    });
    if (!res.ok) {
      console.error("Razorpay order failed:", res.status, await res.text());
      throw new Error("Couldn't start the payment. Please try again.");
    }
    const order = (await res.json()) as { id: string };

    return {
      alreadyOwned: false as const,
      orderId: order.id,
      amount,
      currency: "INR",
      keyId,
      productTitle: product.title,
    };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        productId: z.string().uuid(),
        orderId: z.string(),
        paymentId: z.string(),
        signature: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) throw new Error("Payment gateway is not configured.");

    const { createHmac, timingSafeEqual } = await import("crypto");
    const expected = createHmac("sha256", keySecret)
      .update(`${data.orderId}|${data.paymentId}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(data.signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("Payment verification failed.");
    }

    const { data: product } = await context.supabase
      .from("products")
      .select("price")
      .eq("id", data.productId)
      .single();

    const { error } = await context.supabase.from("purchases").insert({
      user_id: context.userId,
      product_id: data.productId,
      amount: product?.price ?? 0,
      currency: "INR",
      razorpay_order_id: data.orderId,
      razorpay_payment_id: data.paymentId,
    });
    // 23505 = already purchased (e.g. double-submitted handler) — treat as success.
    if (error && error.code !== "23505") {
      console.error("Failed to record purchase:", error);
      throw new Error("Payment succeeded but we couldn't save your purchase. Contact support.");
    }
    return { ok: true as const };
  });
