<?php
// db.php - Database Connection for XAMPP (phpMyAdmin) / Docker

// Check if running in Docker
$isDocker = isset($_ENV['DB_HOST']) && $_ENV['DB_HOST'] !== 'localhost';

if ($isDocker) {
    // Docker Credentials
    $DB_HOST = $_ENV['DB_HOST'] ?? 'dbserver';
    $DB_NAME = $_ENV['DB_NAME'] ?? 'tourify';
    $DB_USER = $_ENV['DB_USER'] ?? 'appuser';
    $DB_PASS = $_ENV['DB_PASSWORD'] ?? 'secret123';
} else {
    // XAMPP Default Credentials
    $DB_HOST = 'localhost';
    $DB_NAME = 'tourify';
    $DB_USER = 'root';
    $DB_PASS = '';
}
$DB_CHARSET = 'utf8mb4';

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=$DB_CHARSET";

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    // Connection successful
    // error_log("Database connected to $DB_HOST:$DB_NAME");
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());

    // Check if we're in API context (check for JSON header)
    if (
        stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false ||
        stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false ||
        strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false
    ) {
        // Return JSON error
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection error']);
        exit;
    } else {
        // Display human-readable error
        die('Database connection failed. Please check if XAMPP MySQL is running. Error: ' . $e->getMessage());
    }
}

function get_db()
{
    global $pdo;
    return $pdo;
}
?>