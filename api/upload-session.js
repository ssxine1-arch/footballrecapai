module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { size, mimeType } = req.body || {};

    if (!size || !mimeType) {
      return res.status(400).json({
        error: "Video information မရပါ"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/upload/v1beta/files",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY,
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": String(size),
          "X-Goog-Upload-Header-Content-Type": mimeType,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          file: {
            display_name: "recap-video"
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Gemini upload error");
    }

    const uploadUrl =
      response.headers.get("x-goog-upload-url");

    if (!uploadUrl) {
      throw new Error("Upload URL မရပါ");
    }

    return res.status(200).json({
      uploadUrl
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Upload session error"
    });
  }
};
