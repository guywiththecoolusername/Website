export default async function handler(req, res) {
  try {
    const { url } = req.query;

    // Validate URL
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const discordCDNRegex = /^https:\/\/cdn\.discordapp\.com\/attachments\//;
    if (!discordCDNRegex.test(url)) {
      return res.status(400).json({ error: "Invalid URL. Only Discord CDN links are allowed." });
    }

    // Fetch the resource from Discord CDN
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://discord.com/',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch resource: ${response.statusText}` });
    }

    // Pass through content-type and caching headers
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Stream the file directly to the client
    const readableStream = response.body;
    readableStream.pipe(res);

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
