import { createFileRoute } from "@tanstack/react-router";

import { InfoPage, infoHead } from "@/components/info-page";
import { CONTACT_EMAIL } from "@/lib/contact";

export const Route = createFileRoute("/terms")({
  head: () => infoHead("अटी व शर्ती", "Smart Ness वापरण्याच्या अटी व शर्ती."),
  component: () => (
    <InfoPage title="अटी व शर्ती">
      <section>
        <h2>वापराचा परवाना</h2>
        <p>
          खरेदी केलेली PDF फक्त तुमच्या वैयक्तिक वापरासाठी आहे. PDF वर तुमचे नाव वॉटरमार्क म्हणून छापले
          जाते; ती पुनर्विक्री करणे, सार्वजनिक करणे किंवा इतरांना वाटणे मनाई आहे.
        </p>
      </section>
      <section>
        <h2>खाते</h2>
        <p>
          तुमच्या खात्याची आणि पासवर्डची सुरक्षा तुमची जबाबदारी आहे. खात्यातून झालेल्या सर्व खरेदींसाठी
          तुम्ही जबाबदार असाल.
        </p>
      </section>
      <section>
        <h2>किंमत आणि पेमेंट</h2>
        <p>
          सर्व किमती भारतीय रुपयांत (₹) आहेत. पेमेंट यशस्वी झाल्यानंतरच डाउनलोड उपलब्ध होते. परताव्याबाबत
          आमचे परतावा धोरण पाहा.
        </p>
      </section>
      <section>
        <h2>बदल</h2>
        <p>आम्ही या अटी वेळोवेळी अद्ययावत करू शकतो. प्रश्नांसाठी {CONTACT_EMAIL} वर संपर्क साधा.</p>
      </section>
    </InfoPage>
  ),
});
