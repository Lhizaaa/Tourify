<?php
// save-review.php - Save review to database
session_start();
ob_clean();
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
ini_set('display_errors', 0);
error_reporting(E_ALL);
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: $errstr in $errfile:$errline");
    return true;
});

require_once __DIR__ . '/../../config/database.php';

// Check if user is authenticated
if (!isset($_SESSION['user_id'])) {
    error_log("save-review.php: No user_id in session. Session contents: " . json_encode($_SESSION));
    echo json_encode([
        'success' => false,
        'message' => 'User not authenticated'
    ]);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

error_log("save-review.php: Saving review for user_id: " . $_SESSION['user_id'] . ", destination_id: " . ($input['destination_id'] ?? 'N/A'));

// Validate input
if (!isset($input['destination_id']) || !isset($input['rating']) || !isset($input['review_text'])) {
    error_log("save-review.php: Missing required fields. Input: " . json_encode($input));
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];
$destination_id = intval($input['destination_id']);
$rating = intval($input['rating']);
$review_text = trim($input['review_text']);

// Validate rating
if ($rating < 1 || $rating > 5) {
    echo json_encode([
        'success' => false,
        'message' => 'Rating harus antara 1-5'
    ]);
    exit;
}

// Validate review text
if (strlen($review_text) < 10) {
    echo json_encode([
        'success' => false,
        'message' => 'Ulasan minimal 10 karakter'
    ]);
    exit;
}

try {
    $db = get_db();

    // Insert review into database
    $sql = "INSERT INTO REVIEW (user_id, destination_id, rating, review_text, created_at) 
            VALUES (:user_id, :destination_id, :rating, :review_text, NOW())";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':user_id' => $user_id,
        ':destination_id' => $destination_id,
        ':rating' => $rating,
        ':review_text' => $review_text
    ]);

    // Get the review ID
    $review_id = $db->lastInsertId();

    error_log("save-review.php: Review saved successfully. Review ID: " . $review_id . ", user_id: " . $user_id);

    echo json_encode([
        'success' => true,
        'message' => 'Review berhasil disimpan',
        'review_id' => $review_id
    ]);

} catch (PDOException $e) {
    error_log('Review save error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Gagal menyimpan review: ' . $e->getMessage()
    ]);
}
?>