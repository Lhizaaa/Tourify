<?php
/**
 * Image Upload Handler
 * Handles file upload for destinations and tour guides
 */
// Start session
session_start();

// Clear any output and set JSON header
if (ob_get_level())
    ob_end_clean();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Disable error display (send to logs only)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Custom error handler to prevent HTML output
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error [$errno]: $errstr in $errfile:$errline");
    return true;
});

// Check if user/admin is authenticated
if (!isset($_SESSION['admin_id']) && !isset($_SESSION['user_id'])) {
    http_response_code(401);
    die(json_encode(['success' => false, 'error' => 'Unauthorized - Please login']));
}

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    die();
}

// Determine subdirectory based on type
$type = isset($_POST['type']) ? preg_replace('/[^a-z0-9_-]/i', '', $_POST['type']) : 'unknown';
$uploadSubdir = ($type === 'destination') ? 'destinations' : (($type === 'guide') ? 'guides' : 'other');
$uploadDir = __DIR__ . '/../public/assets/uploads/' . $uploadSubdir . '/';

// Ensure upload directory exists
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        die(json_encode(['success' => false, 'error' => 'Cannot create upload directory']));
    }
}

// Check if directory is writable
if (!is_writable($uploadDir)) {
    http_response_code(500);
    die(json_encode(['success' => false, 'error' => 'Upload directory is not writable']));
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    if (!isset($_FILES['file'])) {
        throw new Exception('No file provided');
    }

    $file = $_FILES['file'];

    // Validate file
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File upload incomplete',
            UPLOAD_ERR_NO_FILE => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Temporary directory missing',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file',
            UPLOAD_ERR_EXTENSION => 'File upload blocked by extension'
        ];
        throw new Exception($errorMessages[$file['error']] ?? 'Unknown upload error');
    }

    // Verify file actually exists
    if (!is_uploaded_file($file['tmp_name'])) {
        throw new Exception('File is not a valid upload');
    }

    // Check file size (max 5MB) - first check
    if ($file['size'] > 5 * 1024 * 1024) {
        throw new Exception('File too large (max 5MB)');
    }

    // Validate MIME type using fileinfo
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if (!$finfo) {
        throw new Exception('Cannot initialize file info');
    }

    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowed)) {
        throw new Exception("Invalid file type ($mimeType). Allowed: JPG, PNG, GIF, WebP");
    }

    // Generate unique filename
    $timestamp = time();
    // Note: $type is already defined at the top of the script
    $originalName = basename($file['name']);
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    // Whitelist extensions
    $allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($ext, $allowedExt)) {
        throw new Exception("Invalid file extension: $ext");
    }

    // Sanitize filename
    $baseName = pathinfo($originalName, PATHINFO_FILENAME);
    $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '', $baseName);
    if (empty($baseName)) {
        $baseName = 'image';
    }

    $newFilename = "${type}-${timestamp}-${baseName}.${ext}";
    $uploadPath = $uploadDir . $newFilename;

    // Prevent directory traversal
    $realPath = realpath($uploadDir);
    $realFile = realpath(dirname($uploadPath)) . DIRECTORY_SEPARATOR . basename($uploadPath);

    if (strpos($realFile, $realPath) !== 0) {
        throw new Exception('Invalid file path');
    }

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to save file to disk');
    }

    // Verify file was actually saved
    if (!file_exists($uploadPath)) {
        throw new Exception('File saved but cannot be verified');
    }

    // Return success with filename
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'filename' => $newFilename,
        'path' => './public/assets/uploads/' . $uploadSubdir . '/' . $newFilename,
        'message' => 'File uploaded successfully'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>