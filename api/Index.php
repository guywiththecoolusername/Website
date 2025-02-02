<?php
// Check if a URL parameter is provided
if (isset($_GET['url'])) {
    $url = $_GET['url'];
    
    // Validate the URL
    if (filter_var($url, FILTER_VALIDATE_URL)) {
        try {
            // Fetch HTML content
            $html = file_get_contents($url);
            
            // Sanitize the content (basic example)
            $sanitized_html = htmlspecialchars($html, ENT_QUOTES, 'UTF-8');
            
            // Output the HTML
            header('Content-Type: text/html');
            echo $sanitized_html;
            exit;
        } catch (Exception $e) {
            // Handle errors
            header("HTTP/1.1 500 Internal Server Error");
            echo "<h1>Error</h1><p>Failed to fetch HTML from $url.</p>";
            exit;
        }
    } else {
        // Invalid URL
        header("HTTP/1.1 400 Bad Request");
        echo "<h1>Error</h1><p>Invalid URL provided.</p>";
        exit;
    }
} else {
    // No URL parameter: Redirect to personal card
    header("Location: /");
    exit;
}
?>
