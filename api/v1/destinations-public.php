<?php
/**
 * Public API - Get Destinations (No Authentication Required)
 */
ob_clean();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
// Prevent caching - always fetch fresh data
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
ini_set('display_errors', 0);
error_reporting(E_ALL);
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    error_log("PHP Error: $errstr in $errfile:$errline");
    return true;
});

require_once __DIR__ . '/../../config/database.php';

$pdo = get_db();
$action = $_GET['action'] ?? 'list';

try {
    if ($action === 'list') {
        // Get all active destinations with ratings
        $stmt = $pdo->prepare("
            SELECT 
                d.destination_id as id,
                d.name,
                d.location,
                d.price,
                d.description,
                d.image,
                d.maps_link,
                d.facilities,
                c.name as category,
                (SELECT COUNT(*) FROM REVIEW WHERE destination_id = d.destination_id) as reviews,
                (SELECT AVG(rating) FROM REVIEW WHERE destination_id = d.destination_id) as rating,
                d.created_at
            FROM DESTINATION d
            LEFT JOIN CATEGORY c ON d.category_id = c.category_id
            WHERE d.status = 'active' OR d.status IS NULL
            ORDER BY d.created_at DESC
        ");
        $stmt->execute();
        $destinations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format data untuk match dengan frontend
        $formatted = array_map(function ($dest) {
            // Parse facilities JSON
            $facilities = [];
            if (!empty($dest['facilities'])) {
                $decoded = json_decode($dest['facilities'], true);
                if (is_array($decoded)) {
                    $facilities = $decoded;
                }
            }

            return [
                'id' => 'dest-' . $dest['id'], // Add prefix untuk ID unik
                'destination_id' => $dest['id'],
                'name' => $dest['name'],
                'location' => $dest['location'],
                'price' => (int) $dest['price'],
                'description' => $dest['description'],
                'image' => $dest['image'] ? 'destinations/' . $dest['image'] : './public/assets/placeholder-destination.jpg',
                'maps_link' => $dest['maps_link'] ?: null,
                'facilities' => $facilities,
                'category' => $dest['category'] ?: 'Umum',
                'rating' => $dest['rating'] ? round($dest['rating'], 1) : 4.5,
                'reviews' => (int) ($dest['reviews'] ?? 0),
            ];
        }, $destinations);

        echo json_encode([
            'success' => true,
            'data' => $formatted,
            'total' => count($formatted)
        ]);

    } elseif ($action === 'detail') {
        $id = $_GET['id'] ?? 0;

        // Support both 'dest-123' and '123' formats
        if (strpos($id, 'dest-') === 0) {
            $id = substr($id, 5);
        }

        $stmt = $pdo->prepare("
            SELECT 
                d.destination_id,
                d.name,
                d.location,
                d.price,
                d.description,
                d.image,
                d.maps_link,
                d.facilities,
                c.name as category,
                (SELECT COUNT(*) FROM REVIEW WHERE destination_id = d.destination_id) as reviews,
                (SELECT AVG(rating) FROM REVIEW WHERE destination_id = d.destination_id) as rating
            FROM DESTINATION d
            LEFT JOIN CATEGORY c ON d.category_id = c.category_id
            WHERE d.destination_id = ?
        ");
        $stmt->execute([$id]);
        $destination = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($destination) {
            // Parse facilities JSON
            $facilities = [];
            if (!empty($destination['facilities'])) {
                $decoded = json_decode($destination['facilities'], true);
                if (is_array($decoded)) {
                    $facilities = $decoded;
                }
            }

            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => 'dest-' . $destination['destination_id'],
                    'destination_id' => $destination['destination_id'],
                    'name' => $destination['name'],
                    'location' => $destination['location'],
                    'price' => (int) $destination['price'],
                    'description' => $destination['description'],
                    'image' => $destination['image'] ? 'destinations/' . $destination['image'] : './public/assets/placeholder-destination.jpg',
                    'maps_link' => $destination['maps_link'] ?: null,
                    'facilities' => $facilities,
                    'category' => $destination['category'] ?: 'Umum',
                    'rating' => $destination['rating'] ? round($destination['rating'], 1) : 4.5,
                    'reviews' => (int) ($destination['reviews'] ?? 0),
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Destinasi tidak ditemukan']);
        }

    } elseif ($action === 'categories') {
        // Get all categories for filtering
        $stmt = $pdo->query("SELECT * FROM CATEGORY ORDER BY name");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $categories
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Action tidak dikenal'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>