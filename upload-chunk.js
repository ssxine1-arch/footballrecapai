module.exports.config = {
  api: {
    bodyParser: false
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const uploadUrl = req.headers["x-upload-url"];
    const offset = req.headers["x-upload-offset"];
    const command = req.headers["x-upload-command"] || "upload";

    if (!uploadUrl || offset === undefined) {
      return res.status(400).json({
        error: "Upload information မပြည့်စုံပါ"
      });
    }

    const chunks = [];
    let total = 0;

    for await (const chunk of req) {
      total += chunk.length;

      if (total > 4 * 1024 * 1024) {
        return res.status(413).json({
          error: "Chunk ကြီးလွန်းပါတယ်"
        });
      }

      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks);

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": String(body.length),
        "X-Goog-Upload-Offset": String(offset),
        "X-Goog-Upload-Command": command
      },
      body
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: text || "Gemini upload failed"
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Upload failed"
    });
  }
};
