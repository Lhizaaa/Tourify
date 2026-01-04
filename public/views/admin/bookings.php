<?php
/**
 * Admin API - Manage Bookings
 * Path: /admin/bookings.php
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/auth.php';

// Ensure user is authenticated
if (!isAdminLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

ob_clean();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(E_ALL);

$pdo = get_db();
$action = $_GET['action'] ?? 'list';

try {
    if ($action === 'list') {
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $page = intval($_GET['page'] ?? 1);
        $limit = 10;
        $offset = ($page - 1) * $limit;

        // Build base query
        $where = "WHERE 1=1";
        $params = [];

        if ($search) {
            $where .= " AND (u.name LIKE ? OR u.email LIKE ? OR d.name LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        if ($status) {
            $where .= " AND b.status = ?";
            $params[] = $status;
        }

        // Get data
        $query = "SELECT 
                    b.booking_id,
                    b.user_id,
                    b.destination_id,
                    b.guide_id,
                    b.booking_date,
                    b.ticket_quantity,
                    b.total_price,
                    b.status,
                    b.created_at,
                    u.name as user_name,
                    u.email as user_email,
                    d.name as destination_name,
                    g.name as guide_name,
                    p.payment_method,
                    p.payment_status
                FROM BOOKING b
                LEFT JOIN USER u ON b.user_id = u.user_id
                LEFT JOIN DESTINATION d ON b.destination_id = d.destination_id
                LEFT JOIN TourGuide g ON b.guide_id = g.guide_id
                LEFT JOIN PAYMENT p ON b.booking_id = p.booking_id
                $where
                ORDER BY b.created_at DESC 
                LIMIT ? OFFSET ?";

        $params[] = $limit;
        $params[] = $offset;

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Count total
        $countQuery = "SELECT COUNT(*) as total FROM BOOKING b
                LEFT JOIN USER u ON b.user_id = u.user_id
                LEFT JOIN DESTINATION d ON b.destination_id = d.destination_id
                $where";

        $countParams = [];
        if ($search) {
            $countParams[] = "%$search%";
            $countParams[] = "%$search%";
            $countParams[] = "%$search%";
        }
        if ($status) {
            $countParams[] = $status;
        }

        $countStmt = $pdo->prepare($countQuery);
        $countStmt->execute($countParams);
        $total = $countStmt->fetch()['total'];

        echo json_encode([
            'success' => true,
            'data' => $bookings,
            'total' => $total,
            'pages' => ceil($total / $limit),
            'current_page' => $page
        ]);

    } elseif ($action === 'detail') {
        $id = $_GET['id'] ?? 0;

        $stmt = $pdo->prepare("SELECT 
                    b.booking_id,
                    b.user_id,
                    b.destination_id,
                    b.guide_id,
                    b.booking_date,
                    b.ticket_quantity,
                    b.total_price,
                    b.status,
                    b.created_at,
                    u.name as user_name,
                    u.email as user_email,
                    u.phone as user_phone,
                    d.name as destination_name,
                    d.location as destination_location,
                    d.price as destination_price,
                    g.name as guide_name,
                    g.contact as guide_contact,
                    g.price as guide_price,
                    p.payment_method,
                    p.payment_status,
                    p.payment_date
                FROM BOOKING b
                LEFT JOIN USER u ON b.user_id = u.user_id
                LEFT JOIN DESTINATION d ON b.destination_id = d.destination_id
                LEFT JOIN TourGuide g ON b.guide_id = g.guide_id
                LEFT JOIN PAYMENT p ON b.booking_id = p.booking_id
                WHERE b.booking_id = ?");

        $stmt->execute([$id]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($booking) {
            echo json_encode(['success' => true, 'data' => $booking]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
        }

    } elseif ($action === 'update') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['booking_id'] ?? 0;
        $status = $data['status'] ?? 'pending';

        $stmt = $pdo->prepare("UPDATE BOOKING SET status = ? WHERE booking_id = ?");
        $stmt->execute([$status, $id]);

        if ($stmt->rowCount() > 0) {
            // Update payment status jika ada
            if ($status === 'paid') {
                $stmt = $pdo->prepare("UPDATE PAYMENT SET payment_status = 'completed', payment_date = ? WHERE booking_id = ?");
                $stmt->execute([date('Y-m-d'), $id]);
            }
            echo json_encode(['success' => true, 'message' => 'Booking status updated']);
        } else {
            echo json_encode(['error' => 'Failed to update booking']);
        }

    } elseif ($action === 'delete') {
        $id = $_GET['id'] ?? 0;

        // Delete associated payment first
        $stmt = $pdo->prepare("DELETE FROM PAYMENT WHERE booking_id = ?");
        $stmt->execute([$id]);

        // Delete booking
        $stmt = $pdo->prepare("DELETE FROM BOOKING WHERE booking_id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Booking deleted']);
        } else {
            echo json_encode(['error' => 'Failed to delete booking']);
        }

    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
