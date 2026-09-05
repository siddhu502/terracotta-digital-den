import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

import { InfoPage, infoHead } from "@/components/info-page";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";

export const Route = createFileRoute("/contact")({
  head: () => infoHead("संपर्क", "Smart Ness शी ईमेल किंवा फोनद्वारे संपर्क साधा."),
  component: () => (
    <InfoPage title="संपर्क" intro="प्रश्न, मदत किंवा सूचना — आम्हाला जरूर कळवा.">
      <ul className="!list-none !pl-0 space-y-4">
        <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Mail className="size-5 text-primary" />
          <span>
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">ईमेल</span>
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-foreground">{CONTACT_EMAIL}</a>
          </span>
        </li>
        <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Phone className="size-5 text-primary" />
          <span>
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">फोन</span>
            <a href={`tel:+91${CONTACT_PHONE}`} className="font-medium text-foreground">{CONTACT_PHONE}</a>
          </span>
        </li>
        <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <MapPin className="size-5 text-primary" />
          <span>
            <span className="block text-xs uppercase tracking-wider text-muted-foreground">पत्ता</span>
            <span className="font-medium text-foreground">{CONTACT_ADDRESS}</span>
          </span>
        </li>
      </ul>
    </InfoPage>
  ),
});
