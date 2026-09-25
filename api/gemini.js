export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { fileUri, mimeType, style } = req.body || {};

    if (!fileUri || !mimeType) {
      return res.status(400).json({
        error: "Video file မရပါ"
      });
    }

    const prompts = {
      football: `
ဒီဗီဒီယိုကို သေချာကြည့်ပြီး မြန်မာလို Football Recap ရေးပါ။
သူငယ်ချင်းကို ပြန်ပြောပြနေသလို သဘာဝကျတဲ့ စကားပြောပုံစံသုံးပါ။
ဗီဒီယိုထဲက ဖြစ်ရပ်တွေကို အစဉ်လိုက်ဖော်ပြပါ။
TikTok / Facebook Shorts Voice-over အတွက် စိတ်ဝင်စားစရာကောင်းအောင် ရေးပါ။
အရမ်းတိုမရေးပါနဲ့။
ဗီဒီယိုထဲမှာ မပါဝင်တဲ့အချက်တွေ မဖန်တီးပါနဲ့။
`,

      movie: `
ဒီဗီဒီယိုကို သေချာကြည့်ပြီး မြန်မာလို Movie Recap ရေးပါ။
ဇာတ်လမ်းကို အစဉ်လိုက် သဘာဝကျတဲ့ စကားပြောပုံစံနဲ့ ပြန်ပြောပါ။
ဗီဒီယိုထဲမှာ မပါဝင်တဲ့အချက်တွေ မဖန်တီးပါနဲ့။
`,

      tiktok: `
ဒီဗီဒီယိုအတွက် မြန်မာလို TikTok / Shorts Recap ရေးပါ။
အစမှာ စိတ်ဝင်စားစရာ Hook ထည့်ပါ။
သဘာဝကျတဲ့ စကားပြောပုံစံနဲ့ ရေးပါ။
`,

      natural: `
ဒီဗီဒီယိုကို မြန်မာလို သဘာဝကျတဲ့ စကားပြောပုံစံနဲ့ ပြန်ပြောပြပါ။
သူငယ်ချင်းတစ်ယောက်ကို ရှင်းပြနေသလို ရေးပါ။
ဗီဒီယိုထဲမှာ မပါဝင်တဲ့အချက်တွေ မဖန်တီးပါနဲ့။
`
    };

    const prompt = prompts[style] || prompts.football;

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
      throw new Error(
        data.error?.message || "Gemini API Error"
      );
    }

    const result =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    if (!result) {
      throw new Error("Gemini က Recap မပြန်ပါ");
    }

    return res.status(200).json({ result });

  } catch (error) {
    console.error("GEMINI ERROR:", error);

    return res.status(500).json({
      error: error.message || "Server Error"
    });
  }
}
