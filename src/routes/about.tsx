import { createFileRoute } from "@tanstack/react-router";

import { InfoPage, infoHead } from "@/components/info-page";

export const Route = createFileRoute("/about")({
  head: () => infoHead("आमच्याबद्दल", "Smart Ness — मराठी विद्यार्थी व शिक्षकांसाठी शैक्षणिक PDF चे डिजिटल दुकान."),
  component: () => (
    <InfoPage title="आमच्याबद्दल" intro="Smart Ness हे शैक्षणिक नोट्स, टेम्पलेट्स आणि उपयुक्त PDF साठीचे डिजिटल दुकान आहे.">
      <section>
        <h2>आम्ही काय करतो</h2>
        <p>
          आम्ही विद्यार्थी, शिक्षक आणि पालकांसाठी काळजीपूर्वक तयार केलेल्या PDF उपलब्ध करून देतो. प्रत्येक
          खरेदी त्वरित डाउनलोड होते आणि तुमच्या नावाच्या वॉटरमार्कसह वैयक्तिक केली जाते.
        </p>
      </section>
      <section>
        <h2>माझे स्टोअर</h2>
        <p>
          खरेदी केलेली प्रत्येक PDF तुमच्या "माझे स्टोअर" मध्ये कायम राहते — ती कधीही, मोफत, पुन्हा डाउनलोड
          करा किंवा ऑनलाइन उघडा.
        </p>
      </section>
    </InfoPage>
  ),
});
