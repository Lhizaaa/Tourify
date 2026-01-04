<?php
// get-user-reviews.php - Get reviews created by the logged-in user
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

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    error_log("get-user-reviews.php: No user_id in session");
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in',
        'data' => []
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];
error_log("get-user-reviews.php: Fetching reviews for user_id: " . $user_id);

try {
    $db = get_db();

    // Get all reviews created by this user
    $sql = "SELECT 
                r.review_id,
                r.user_id,
                r.destination_id,
                r.rating,
                r.review_text,
                r.created_at as date,
                d.name as destination_name,
                d.image as destination_image
            FROM REVIEW r
            LEFT JOIN DESTINATION d ON r.destination_id = d.destination_id
            WHERE r.user_id = :user_id
            ORDER BY r.created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':user_id' => $user_id
    ]);

    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("get-user-reviews.php: Found " . count($reviews) . " reviews for user_id: " . $user_id);

    // Format the response
    echo json_encode([
        'success' => true,
        'message' => 'User reviews retrieved successfully',
        'data' => $reviews,
        'count' => count($reviews)
    ]);

} catch (PDOException $e) {
    error_log('User review fetch error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Gagal mengambil ulasan: ' . $e->getMessage(),
        'data' => []
    ]);
}
?>