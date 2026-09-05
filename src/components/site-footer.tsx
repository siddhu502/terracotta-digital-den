import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import { BRAND_NAME } from "@/lib/brand";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

const LINKS = [
  { to: "/about", label: "आमच्याबद्दल" },
  { to: "/contact", label: "संपर्क" },
  { to: "/refund-policy", label: "परतावा धोरण" },
  { to: "/privacy-policy", label: "गोपनीयता धोरण" },
  { to: "/terms", label: "अटी व शर्ती" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/40 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 text-sm sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg">{BRAND_NAME}</p>
          <p className="mt-2 text-muted-foreground">
            प्रत्येक खरेदी म्हणजे डिजिटल डाउनलोड. शिपिंग नाही, कधीच नाही.
          </p>
        </div>
        <nav className="flex flex-col gap-2" aria-label="माहिती पाने">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <address className="flex flex-col gap-2 not-italic text-muted-foreground">
          <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 hover:text-foreground">
            <Mail className="size-4" /> {CONTACT_EMAIL}
          </a>
          <a href={`tel:+91${CONTACT_PHONE}`} className="flex items-center gap-2 hover:text-foreground">
            <Phone className="size-4" /> {CONTACT_PHONE}
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" /> {CONTACT_ADDRESS}
          </span>
        </address>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-4 text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {BRAND_NAME}. सर्व हक्क राखीव.
      </p>
    </footer>
  );
}
