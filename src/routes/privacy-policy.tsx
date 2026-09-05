import { createFileRoute } from "@tanstack/react-router";

import { InfoPage, infoHead } from "@/components/info-page";
import { CONTACT_EMAIL } from "@/lib/contact";

export const Route = createFileRoute("/privacy-policy")({
  head: () => infoHead("गोपनीयता धोरण", "Smart Ness तुमची माहिती कशी गोळा करते व वापरते."),
  component: () => (
    <InfoPage title="गोपनीयता धोरण">
      <section>
        <h2>आम्ही कोणती माहिती गोळा करतो</h2>
        <ul>
          <li>खाते तयार करताना दिलेला ईमेल.</li>
          <li>PDF वर छापण्यासाठी तुम्ही दिलेले नाव.</li>
          <li>खरेदी आणि डाउनलोडचा इतिहास.</li>
        </ul>
      </section>
      <section>
        <h2>माहितीचा वापर</h2>
        <p>
          ही माहिती फक्त तुमची खरेदी पूर्ण करणे, PDF वैयक्तिक करणे, "माझे स्टोअर" दाखवणे आणि गरज
          पडल्यास तुमच्याशी संपर्क साधण्यासाठी वापरली जाते. आम्ही तुमची माहिती विकत नाही.
        </p>
      </section>
      <section>
        <h2>पेमेंट</h2>
        <p>
          पेमेंट Razorpay द्वारे सुरक्षितपणे केले जाते. तुमचे कार्ड किंवा UPI तपशील आमच्याकडे साठवले जात
          नाहीत.
        </p>
      </section>
      <section>
        <h2>संपर्क</h2>
        <p>गोपनीयतेबाबत प्रश्न असल्यास {CONTACT_EMAIL} वर लिहा.</p>
      </section>
    </InfoPage>
  ),
});
