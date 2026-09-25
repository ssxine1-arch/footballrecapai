import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

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

    // Base64 ကို Buffer ပြောင်း
    const videoBuffer = Buffer.from(videoBase64, "base64");

    // Gemini Files API သို့ upload
    let videoFile = await ai.files.upload({
      file: videoBuffer,
      config: {
        mimeType: mimeType
      }
    });

    // Video processing ပြီးသည်အထိ စောင့်
    while (videoFile.state === "PROCESSING") {
      await new Promise(resolve => setTimeout(resolve, 3000));

      videoFile = await ai.files.get({
        name: videoFile.name
      });
    }

    if (videoFile.state === "FAILED") {
      throw new Error("Gemini က Video processing မလုပ်နိုင်ပါ");
    }

    // Video ကို Gemini နဲ့ကြည့်ပြီး Recap ထုတ်
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: createUserContent([
        createPartFromUri(
          videoFile.uri,
          videoFile.mimeType
        ),
        `
ဒီဗီဒီယိုကို သေချာကြည့်ပြီး မြန်မာလို သဘာဝကျတဲ့
Football Recap စကားပြောပုံစံရေးပေးပါ။

TikTok / Facebook Shorts Voice-over အတွက်
စိတ်ဝင်စားစရာကောင်းအောင် ရေးပါ။

ဗီဒီယိုထဲက ဖြစ်ရပ်တွေကို အစဉ်လိုက်ဖော်ပြပါ။
အရမ်းတိုမရေးပါနဲ့။
မသေချာတဲ့အချက်တွေကို မဖန်တီးပါနဲ့။
`
      ])
    });

    return res.status(200).json({
      result: response.text
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Gemini Error"
    });
  }
}
