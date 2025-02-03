export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("❌ Error: No URL provided!");
  
  const apiURL = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(apiURL);
    const html = await response.text();

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    res.status(500).send("❌ Error: Failed to fetch the page.");
  }
}
