import { createFileRoute } from "@tanstack/react-router";

import { InfoPage, infoHead } from "@/components/info-page";
import { CONTACT_EMAIL } from "@/lib/contact";

export const Route = createFileRoute("/refund-policy")({
  head: () => infoHead("परतावा धोरण", "Smart Ness वरील डिजिटल PDF खरेदीसाठीचे परतावा धोरण."),
  component: () => (
    <InfoPage title="परतावा धोरण">
      <section>
        <h2>डिजिटल उत्पादने</h2>
        <p>
          Smart Ness वरील सर्व उत्पादने डिजिटल PDF आहेत आणि पेमेंट होताच त्वरित डाउनलोड होतात. त्यामुळे
          डाउनलोड झालेल्या उत्पादनांवर सर्वसाधारणपणे परतावा दिला जात नाही.
        </p>
      </section>
      <section>
        <h2>परतावा कधी मिळेल</h2>
        <ul>
          <li>पेमेंट झाले पण उत्पादन "माझे स्टोअर" मध्ये दिसले नाही.</li>
          <li>एकाच उत्पादनासाठी चुकून दोनदा पैसे कापले गेले.</li>
          <li>फाईल उघडत नाही किंवा वर्णनापेक्षा पूर्णपणे वेगळी आहे.</li>
        </ul>
      </section>
      <section>
        <h2>विनंती कशी करावी</h2>
        <p>
          खरेदीच्या ७ दिवसांच्या आत {CONTACT_EMAIL} वर पेमेंट तपशील आणि नोंदणीकृत ईमेलसह लिहा. मंजूर
          परतावा ५–७ कामकाजाच्या दिवसांत मूळ पेमेंट पद्धतीवर जमा केला जातो.
        </p>
      </section>
    </InfoPage>
  ),
});
