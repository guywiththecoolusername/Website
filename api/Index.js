const axios = require('axios');
const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');

module.exports = async (req, res) => {
  const { url } = req.query;

  // Log the request
  console.log('Request URL:', url);

  // Serve personal card site if no URL parameter
  if (!url) {
    console.log('No URL provided. Redirecting to public site.');
    return res.redirect(302, '/');
  }

  try {
    // Fetch HTML from the provided URL
    console.log('Fetching HTML from:', url);
    const response = await axios.get(url, { responseType: 'text' });
    const htmlContent = response.data;

    // Parse the HTML and rewrite resource URLs
    const dom = new JSDOM(htmlContent);
    const { document } = dom.window;

    // Rewrite URLs for <link>, <script>, and <img> tags
    document.querySelectorAll('link[href], script[src], img[src]').forEach((element) => {
      if (element.href) {
        element.href = new URL(element.href, url).toString();
      }
      if (element.src) {
        element.src = new URL(element.src, url).toString();
      }
    });

    // Sanitize the HTML
    const purify = DOMPurify(dom.window);
    const sanitizedHTML = purify.sanitize(dom.serialize());

    // Serve sanitized HTML
    console.log('Serving sanitized HTML.');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(sanitizedHTML);
  } catch (error) {
    console.error('Error fetching HTML:', error.message);
    res.status(500).send(`
      <h1>Error</h1>
      <p>Failed to fetch HTML from ${url}.</p>
      <p>Error: ${error.message}</p>
    `);
  }
};
