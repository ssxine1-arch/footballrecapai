module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { fileUri, mimeType, style } = req.body || {};

    if (!fileUri || !mimeType) {
      return res.status(400).json({
        error: "Video file information မရပါ"
      });
    }

    const prompt = `
ဒီ video ကိုကြည့်ပြီး မြန်မာဘာသာနဲ့ recap script ရေးပေးပါ။

Style: ${style || "Natural Burmese Recap"}

စည်းကမ်းများ:
- သဘာဝကျတဲ့ မြန်မာစကားပြောပုံစံဖြစ်ရမယ်
- Video ထဲမှာ တကယ်မြင်ရတာကိုပဲ အခြေခံပါ
- မရှိတဲ့အချက်အလက်တွေ မထည့်ပါနဲ့
- TikTok / Shorts voice-over အတွက် နားထောင်လို့ကောင်းအောင်ရေးပါ
- အစပိုင်းမှာ စိတ်ဝင်စားစရာ Hook ထည့်ပါ
- စာသားကို အရမ်းတိုမထားပါနဲ့
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  file_data: {
                    mime_type: mimeType,
                    file_uri: fileUri
                  }
                },
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini error"
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    return res.status(200).json({
      text
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Gemini request failed"
    });
  }
};
