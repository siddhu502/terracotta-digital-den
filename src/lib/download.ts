import { personalizePdf } from "@/lib/personalize.functions";

/** Builds the personalized PDF on the server and saves it in the browser. */
export async function downloadPersonalizedPdf(productId: string, name: string) {
  const { base64, fileName } = await personalizePdf({ data: { productId, name } });
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
