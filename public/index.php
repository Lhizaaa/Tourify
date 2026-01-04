<?php
/**
 * TourifyV2 - Main Entry Point
 * 
 * This file serves as the primary entry point for all HTTP requests.
 * It initializes the application and routes requests appropriately.
 */

// Define application paths
define('ROOT_PATH', dirname(__DIR__));
define('CONFIG_PATH', ROOT_PATH . '/config');
define('SRC_PATH', ROOT_PATH . '/src');
define('PUBLIC_PATH', ROOT_PATH . '/public');
define('STORAGE_PATH', ROOT_PATH . '/storage');
define('DATABASE_PATH', ROOT_PATH . '/database');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load database configuration
require_once CONFIG_PATH . '/database.php';

// Load PSR-4 autoloader if available (when Composer is used)
if (file_exists(ROOT_PATH . '/vendor/autoload.php')) {
    require_once ROOT_PATH . '/vendor/autoload.php';
}

// Get the requested URI and method
$request_uri = isset($_SERVER['REQUEST_URI']) ? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) : '/';
$request_method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$base_path = isset($_SERVER['SCRIPT_NAME']) ? dirname($_SERVER['SCRIPT_NAME']) : '/';

// Remove base path from request URI if not root
if ($base_path !== '/' && strpos($request_uri, $base_path) === 0) {
    $request_uri = substr($request_uri, strlen($base_path));
}

// Ensure URI starts with /
if (empty($request_uri)) {
    $request_uri = '/';
}

// ROUTING LOGIC

// 1. Serve static assets (CSS, JS, Images)
if (preg_match('/^\/(assets|images)\//', $request_uri)) {
    $file = PUBLIC_PATH . $request_uri;
    if (file_exists($file) && is_file($file)) {
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        $mime_types = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'webp' => 'image/webp',
        ];
        
        if (isset($mime_types[$extension])) {
            header('Content-Type: ' . $mime_types[$extension]);
        }
        header('Cache-Control: public, max-age=86400');
        readfile($file);
        exit;
    }
    http_response_code(404);
    echo "Asset not found: " . htmlspecialchars($request_uri);
    exit;
}

// 2. API endpoints (v1)
if (strpos($request_uri, '/api/v1/') === 0) {
    $api_file = PUBLIC_PATH . '/../api/v1/' . basename($request_uri, '.php') . '.php';
    $api_file = str_replace(['..', '\\'], ['', '/'], $api_file);
    
    if (file_exists($api_file)) {
        require_once $api_file;
        exit;
    }
    
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'API endpoint not found']);
    exit;
}

// 3. Authentication views
if (preg_match('/^\/(login|register|logout|auth)/', $request_uri)) {
    if ($request_uri === '/login') {
        require_once PUBLIC_PATH . '/views/auth/login.php';
        exit;
    } elseif ($request_uri === '/register') {
        require_once PUBLIC_PATH . '/views/auth/register.php';
        exit;
    } elseif ($request_uri === '/logout') {
        require_once PUBLIC_PATH . '/views/auth/logout.php';
        exit;
    }
}

// 4. Admin panel
if (strpos($request_uri, '/admin') === 0) {
    require_once PUBLIC_PATH . '/views/admin/admin.php';
    exit;
}

// 5. Default home page or view files
if ($request_uri === '/' || $request_uri === '/index.php') {
    // Load home page or dashboard
    if (isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
        // Load dashboard for logged-in users
        echo "Welcome, " . htmlspecialchars($_SESSION['user_name'] ?? 'User') . "! Dashboard coming soon.";
    } else {
        // Load home page for guests
        echo "Welcome to TourifyV2! Please <a href='/login'>login</a> or <a href='/register'>register</a>.";
    }
    exit;
}

// 6. Catch-all: Try to load from views directory
$view_file = PUBLIC_PATH . '/views/' . ltrim($request_uri, '/') . '.php';
$view_file = str_replace(['..', '\\'], ['', '/'], $view_file);

if (file_exists($view_file)) {
    require_once $view_file;
    exit;
}

// 7. 404 - Not found
http_response_code(404);
echo "<h1>404 - Page Not Found</h1>";
echo "<p>The requested page <code>" . htmlspecialchars($request_uri) . "</code> does not exist.</p>";
echo "<p><a href='/'>Return to home</a></p>";
