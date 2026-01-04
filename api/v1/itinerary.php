<?php
/**
 * Itinerary API - Save, Load, Update, Delete
 */
session_start();
ob_clean();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
ini_set('display_errors', 0);
error_reporting(E_ALL);
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: $errstr in $errfile:$errline");
    return true;
});

require_once __DIR__ . '/../../config/database.php';

// Check session
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$pdo = get_db();
$userId = $_SESSION['user_id'];
$action = $_GET['action'] ?? $_POST['action'] ?? 'list';

try {
    if ($action === 'list') {
        // Get all itineraries for user
        $stmt = $pdo->prepare("
            SELECT 
                i.itinerary_id,
                i.title,
                i.start_date,
                i.end_date,
                i.created_at,
                COUNT(id.itinerary_detail_id) as destination_count
            FROM ITINERARY i
            LEFT JOIN ItineraryDetail id ON i.itinerary_id = id.itinerary_id
            WHERE i.user_id = ?
            GROUP BY i.itinerary_id
            ORDER BY i.created_at DESC
        ");
        $stmt->execute([$userId]);
        $itineraries = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $itineraries,
            'total' => count($itineraries)
        ]);

    } elseif ($action === 'detail') {
        $itineraryId = $_GET['id'] ?? 0;

        // Get itinerary header
        $stmt = $pdo->prepare("
            SELECT 
                itinerary_id,
                title,
                start_date,
                end_date,
                created_at
            FROM ITINERARY
            WHERE itinerary_id = ? AND user_id = ?
        ");
        $stmt->execute([$itineraryId, $userId]);
        $itinerary = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$itinerary) {
            echo json_encode(['success' => false, 'message' => 'Itinerary not found']);
            exit;
        }

        // Get itinerary details with destinations
        $stmt = $pdo->prepare("
            SELECT 
                id.itinerary_detail_id,
                id.day,
                id.notes,
                d.destination_id,
                d.name,
                d.location,
                d.price,
                d.image,
                d.description,
                c.name as category
            FROM ItineraryDetail id
            JOIN DESTINATION d ON id.destination_id = d.destination_id
            LEFT JOIN CATEGORY c ON d.category_id = c.category_id
            WHERE id.itinerary_id = ?
            ORDER BY id.day
        ");
        $stmt->execute([$itineraryId]);
        $details = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format response
        $days = [];
        foreach ($details as $detail) {
            $dayNum = $detail['day'];
            if (!isset($days[$dayNum])) {
                $days[$dayNum] = [
                    'day' => $dayNum,
                    'title' => "Hari $dayNum",
                    'destinations' => [],
                    'notes' => ''
                ];
            }
            $days[$dayNum]['destinations'][] = [
                'id' => 'dest-' . $detail['destination_id'],
                'destination_id' => $detail['destination_id'],
                'name' => $detail['name'],
                'location' => $detail['location'],
                'price' => (int) $detail['price'],
                'image' => $detail['image'],
                'description' => $detail['description'],
                'category' => $detail['category']
            ];
            $days[$dayNum]['notes'] = $detail['notes'];
        }

        // Calculate total cost
        $totalCost = array_reduce($details, function ($sum, $item) {
            return $sum + (int) $item['price'];
        }, 0);

        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $itinerary['itinerary_id'],
                'name' => $itinerary['title'],
                'startDate' => $itinerary['start_date'],
                'endDate' => $itinerary['end_date'],
                'days' => array_values($days),
                'destinations' => array_column($details, 'destination_id'),
                'totalCost' => $totalCost,
                'createdAt' => $itinerary['created_at']
            ]
        ]);

    } elseif ($action === 'save') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['name']) || !isset($data['startDate'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
            exit;
        }

        // Calculate end date
        $startDate = $data['startDate'];
        $days = $data['days'] ?? 1;
        $endDate = date('Y-m-d', strtotime("$startDate +$days days"));

        $itineraryId = $data['id'] ?? null;

        // Check if updating or creating
        if ($itineraryId) {
            // Update existing
            $stmt = $pdo->prepare("
                UPDATE ITINERARY
                SET title = ?, start_date = ?, end_date = ?
                WHERE itinerary_id = ? AND user_id = ?
            ");
            $result = $stmt->execute([$data['name'], $startDate, $endDate, $itineraryId, $userId]);
        } else {
            // Create new
            $stmt = $pdo->prepare("
                INSERT INTO ITINERARY (user_id, title, start_date, end_date)
                VALUES (?, ?, ?, ?)
            ");
            $result = $stmt->execute([$userId, $data['name'], $startDate, $endDate]);
            $itineraryId = $pdo->lastInsertId();
        }

        if (!$result) {
            throw new Exception('Failed to save itinerary');
        }

        // Delete existing details if updating
        if ($data['id']) {
            $stmt = $pdo->prepare("DELETE FROM ItineraryDetail WHERE itinerary_id = ?");
            $stmt->execute([$itineraryId]);
        }

        // Insert new details
        $stmt = $pdo->prepare("
            INSERT INTO ItineraryDetail (itinerary_id, destination_id, day, notes)
            VALUES (?, ?, ?, ?)
        ");

        if (isset($data['itineraryDays']) && is_array($data['itineraryDays'])) {
            foreach ($data['itineraryDays'] as $dayData) {
                $dayNum = $dayData['day'] ?? 0;
                $notes = $dayData['notes'] ?? '';
                $destinations = $dayData['destinations'] ?? [];

                foreach ($destinations as $destId) {
                    // Extract numeric ID from 'dest-123' format
                    $numericDestId = $destId;
                    if (strpos($destId, 'dest-') === 0) {
                        $numericDestId = substr($destId, 5);
                    }

                    $stmt->execute([$itineraryId, $numericDestId, $dayNum, $notes]);
                }
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Itinerary saved successfully',
            'id' => $itineraryId
        ]);

    } elseif ($action === 'delete') {
        $itineraryId = $_GET['id'] ?? 0;

        // Check ownership
        $stmt = $pdo->prepare("SELECT user_id FROM ITINERARY WHERE itinerary_id = ?");
        $stmt->execute([$itineraryId]);
        $itinerary = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$itinerary || $itinerary['user_id'] != $userId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            exit;
        }

        // Delete details first
        $stmt = $pdo->prepare("DELETE FROM ItineraryDetail WHERE itinerary_id = ?");
        $stmt->execute([$itineraryId]);

        // Delete itinerary
        $stmt = $pdo->prepare("DELETE FROM ITINERARY WHERE itinerary_id = ?");
        $result = $stmt->execute([$itineraryId]);

        echo json_encode([
            'success' => $result,
            'message' => $result ? 'Itinerary deleted successfully' : 'Failed to delete itinerary'
        ]);

    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
