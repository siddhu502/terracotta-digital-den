import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function InfoPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl md:text-4xl">{title}</h1>
        {intro ? <p className="mt-3 text-muted-foreground">{intro}</p> : null}
        <div className="prose-sm mt-8 space-y-6 text-sm leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function infoHead(title: string, description: string) {
  const full = `${title} — Smart Ness`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
