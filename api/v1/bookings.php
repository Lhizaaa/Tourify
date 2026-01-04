<?php
/**
 * API untuk mendapatkan informasi tour guide berdasarkan booking ID
 * Digunakan untuk menampilkan detail guide di profile dan history booking
 */
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

$action = $_GET['action'] ?? '';
$pdo = get_db();

try {
    switch ($action) {
        case 'get_booking_guide':
            // Get guide info dari booking
            $booking_id = intval($_GET['booking_id'] ?? 0);

            if ($booking_id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid booking ID']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT 
                                    b.booking_id,
                                    b.guide_id,
                                    g.name,
                                    g.rating,
                                    g.contact,
                                    g.bio
                                 FROM BOOKING b
                                 LEFT JOIN TourGuide g ON b.guide_id = g.guide_id
                                 WHERE b.booking_id = ?");
            $stmt->execute([$booking_id]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($booking) {
                echo json_encode(['success' => true, 'data' => $booking]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Booking not found']);
            }
            break;

        case 'user_bookings_with_guides':
            // Get semua booking user dengan guide info
            session_start();
            $user_id = $_GET['user_id'] ?? ($_SESSION['user_id'] ?? 0);

            if ($user_id <= 0) {
                http_response_code(400);
                echo json_encode(['error' => 'User not authenticated']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT 
                                    b.booking_id,
                                    b.destination_id,
                                    b.guide_id,
                                    b.booking_date,
                                    b.status,
                                    d.name as destination_name,
                                    g.name as guide_name,
                                    g.contact as guide_contact
                                 FROM BOOKING b
                                 JOIN DESTINATION d ON b.destination_id = d.destination_id
                                 LEFT JOIN TourGuide g ON b.guide_id = g.guide_id
                                 WHERE b.user_id = ?
                                 ORDER BY b.booking_date DESC");
            $stmt->execute([$user_id]);
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $bookings,
                'count' => count($bookings)
            ]);
            break;

        default:
            echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>