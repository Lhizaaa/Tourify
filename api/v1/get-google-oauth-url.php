<?php
/**
 * Get Google OAuth URL
 * 
 * Returns the Google OAuth authorization URL that the frontend should redirect to.
 */

require_once __DIR__ . '/../config/google-oauth.php';

header('Content-Type: application/json');

try {
    validate_google_oauth_config();
    
    // Optional: Generate and store state parameter for CSRF protection
    session_start();
    $state = bin2hex(random_bytes(32));
    $_SESSION['google_oauth_state'] = $state;
    
    $url = get_google_oauth_url();
    
    echo json_encode([
        'success' => true,
        'url' => $url
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
