const axios = require('axios');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { html } = require('htm/react');

module.exports = async (req, res) => {
  const { url } = req.query;

  // Serve personal card site if no URL parameter
  if (!url) {
    return res.redirect(302, '/'); // Redirect to static site
  }

  try {
    // Fetch HTML from the provided URL
    const response = await axios.get(url, { responseType: 'text' });
    const htmlContent = response.data;

    // Sanitize HTML to prevent XSS attacks
    const window = new JSDOM('').window;
    const purify = DOMPurify(window);
    const sanitizedHTML = purify.sanitize(htmlContent);

    // Serve sanitized HTML
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(sanitizedHTML);
  } catch (error) {
    res.status(500).send(`
      <h1>Error</h1>
      <p>Failed to fetch HTML from ${url}.</p>
    `);
  }
};
