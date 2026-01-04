<?php
// get-user-bookings.php - Get bookings created by the logged-in user
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
    error_log("get-user-bookings.php: No user_id in session");
    echo json_encode([
        'success' => false,
        'message' => 'User not logged in',
        'data' => []
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];
error_log("get-user-bookings.php: Fetching bookings for user_id: " . $user_id);

try {
    $db = get_db();

    // Get all bookings created by this user
    $sql = "SELECT 
                b.booking_id,
                b.user_id,
                b.destination_id,
                b.guide_id,
                b.booking_date,
                b.ticket_quantity,
                b.total_price,
                b.status,
                d.name as destination_name,
                d.image as destination_image,
                d.location as destination_location,
                d.price as destination_price,
                tg.name as guide_name,
                tg.profile_picture as guide_image
            FROM BOOKING b
            LEFT JOIN DESTINATION d ON b.destination_id = d.destination_id
            LEFT JOIN TourGuide tg ON b.guide_id = tg.guide_id
            WHERE b.user_id = :user_id
            ORDER BY b.booking_date DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':user_id' => $user_id
    ]);

    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("get-user-bookings.php: Found " . count($bookings) . " bookings for user_id: " . $user_id);

    // Format the response
    echo json_encode([
        'success' => true,
        'message' => 'User bookings retrieved successfully',
        'data' => $bookings,
        'count' => count($bookings)
    ]);

} catch (PDOException $e) {
    error_log('User booking fetch error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Gagal mengambil riwayat pemesanan: ' . $e->getMessage(),
        'data' => []
    ]);
}
?>