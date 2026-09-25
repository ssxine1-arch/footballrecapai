
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { videoBase64, mimeType } = req.body || {};

    if (!videoBase64 || !mimeType) {
      return res.status(400).json({
        error: "Video မရပါ"
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: videoBase64
            }
          },
          {
            text: `ဒီဘောလုံးဗီဒီယိုကိုကြည့်ပြီး
မြန်မာလို သဘာဝကျတဲ့ Football Recap စကားပြောပုံစံရေးပေးပါ။
TikTok/Facebook Shorts voice-over အတွက် စိတ်ဝင်စားစရာကောင်းအောင်ရေးပါ။
ဗီဒီယိုထဲက ဖြစ်ရပ်တွေကို အစဉ်လိုက်ဖော်ပြပါ။
အရမ်းတိုမရေးပါနဲ့။`
          }
        ]
      }]
    });

    return res.status(200).json({
      result: response.text
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Gemini Error"
    });
  }
}
