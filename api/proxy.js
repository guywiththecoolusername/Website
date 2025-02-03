export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://discord.com/',
        'Accept': '*/*',
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch resource" });
    }

    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
