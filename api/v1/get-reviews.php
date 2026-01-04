<?php
// get-reviews.php - Get reviews for a destination
session_start();
ob_clean();
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: $errstr in $errfile:$errline");
    return true;
});

require_once __DIR__ . '/../../config/database.php';

// Get destination_id from query parameter
if (!isset($_GET['destination_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing destination_id parameter',
        'data' => []
    ]);
    exit;
}

$destination_id = intval($_GET['destination_id']);

try {
    $db = get_db();

    // Get all reviews for the destination with user information
    $sql = "SELECT 
                r.review_id,
                r.user_id,
                r.destination_id,
                r.rating,
                r.review_text,
                r.created_at as date,
                u.name as userName,
                u.profile_picture
            FROM REVIEW r
            LEFT JOIN USERS u ON r.user_id = u.user_id
            WHERE r.destination_id = :destination_id
            ORDER BY r.created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':destination_id' => $destination_id
    ]);

    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the response
    echo json_encode([
        'success' => true,
        'message' => 'Reviews retrieved successfully',
        'data' => $reviews,
        'count' => count($reviews)
    ]);

} catch (PDOException $e) {
    error_log('Review fetch error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Gagal mengambil ulasan: ' . $e->getMessage(),
        'data' => []
    ]);
}
?>