export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Use AllOrigins API to bypass CORS
    const apiUrl = `https://allorigins.on.shiper.app/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch resource" });
    }

    const contentType = response.headers.get('content-type') || 'text/html';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
