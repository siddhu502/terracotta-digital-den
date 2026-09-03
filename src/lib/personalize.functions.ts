import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DEVANAGARI_FONT_URL =
  "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Bold.ttf";

const needsUnicodeFont = (text: string) => /[^\u0000-\u00ff]/.test(text);

/**
 * Builds a personalized copy of a purchased PDF: the buyer's name is printed
 * in bold at the top of the first page and repeated as a diagonal watermark on
 * every page. Only owners of the product (recorded purchase) can call this.
 */
export const personalizePdf = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        productId: z.string().uuid(),
        name: z.string().trim().min(1).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: purchase } = await context.supabase
      .from("purchases")
      .select("id, product:products(title, pdf_url)")
      .eq("user_id", context.userId)
      .eq("product_id", data.productId)
      .maybeSingle();

    const product = purchase?.product as { title: string; pdf_url: string | null } | null;
    if (!purchase || !product) throw new Error("तुम्ही हे उत्पादन अजून खरेदी केलेले नाही.");
    if (!product.pdf_url) throw new Error("या उत्पादनाची फाईल अजून जोडलेली नाही.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: file, error } = await supabaseAdmin.storage
      .from("product-files")
      .download(product.pdf_url);
    if (error || !file) throw new Error("फाईल मिळाली नाही.");

    const [{ PDFDocument, StandardFonts, rgb, degrees }, fontkitModule] = await Promise.all([
      import("pdf-lib"),
      import("@pdf-lib/fontkit"),
    ]);
    const fontkit = (fontkitModule as { default?: unknown }).default ?? fontkitModule;

    const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    pdf.registerFontkit(fontkit as Parameters<typeof pdf.registerFontkit>[0]);

    const name = data.name.trim();
    let font = await pdf.embedFont(StandardFonts.HelveticaBold);
    if (needsUnicodeFont(name)) {
      try {
        const res = await fetch(DEVANAGARI_FONT_URL);
        if (res.ok) font = await pdf.embedFont(await res.arrayBuffer(), { subset: true });
      } catch (err) {
        console.error("Devanagari font unavailable, falling back:", err);
      }
    }

    const brand = rgb(0.72, 0.33, 0.22);
    const pages = pdf.getPages();

    pages.forEach((page, index) => {
      const { width, height } = page.getSize();

      // Diagonal watermark, centered, on every page.
      const wmSize = Math.max(28, Math.min(72, (width * 0.9) / Math.max(name.length, 6)));
      const wmWidth = font.widthOfTextAtSize(name, wmSize);
      const angle = 45;
      const rad = (angle * Math.PI) / 180;
      page.drawText(name, {
        x: width / 2 - (wmWidth / 2) * Math.cos(rad) + (wmSize / 2) * Math.sin(rad),
        y: height / 2 - (wmWidth / 2) * Math.sin(rad) - (wmSize / 2) * Math.cos(rad),
        size: wmSize,
        font,
        color: brand,
        opacity: 0.16,
        rotate: degrees(angle),
      });

      // Bold name banner on top of the first page.
      if (index === 0) {
        const size = Math.max(14, Math.min(26, width / 24));
        const textWidth = font.widthOfTextAtSize(name, size);
        const bannerHeight = size * 2.2;
        page.drawRectangle({
          x: 0,
          y: height - bannerHeight,
          width,
          height: bannerHeight,
          color: rgb(1, 0.97, 0.94),
          opacity: 0.92,
        });
        page.drawText(name, {
          x: (width - textWidth) / 2,
          y: height - bannerHeight / 2 - size / 2.8,
          size,
          font,
          color: brand,
        });
      }
    });

    pdf.setTitle(`${product.title} — ${name}`);
    const bytes = await pdf.save();

    return {
      fileName: `${product.title.replace(/[^\w\u0900-\u097F -]/g, "").trim() || "smart-ness"}-${name.replace(/\s+/g, "_")}.pdf`,
      base64: Buffer.from(bytes).toString("base64"),
    };
  });
