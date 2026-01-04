<?php
/**
 * Test Admin API destinations list
 * Simulate what admin sees
 */
session_start();
$_SESSION['admin_id'] = 1; // Fake session untuk test

ob_clean();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/database.php';

$pdo = get_db();

try {
    // Get first 3 destinations
    $stmt = $pdo->prepare("
        SELECT d.*, c.name as category_name,
               (SELECT COUNT(*) FROM REVIEW WHERE destination_id = d.destination_id) as review_count,
               (SELECT AVG(rating) FROM REVIEW WHERE destination_id = d.destination_id) as avg_rating
        FROM DESTINATION d
        LEFT JOIN CATEGORY c ON d.category_id = c.category_id
        LIMIT 3
    ");
    $stmt->execute();
    $destinations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Check image URLs
    foreach ($destinations as &$dest) {
        if ($dest['image']) {
            $imagePath = __DIR__ . '/../public/assets/uploads/' . $dest['image'];
            $dest['file_exists'] = file_exists($imagePath);
            $dest['generated_url'] = '/Tourify V1/public/assets/uploads/' . $dest['image'];
            $dest['image_field'] = $dest['image'];
        }
    }

    echo json_encode([
        'success' => true,
        'destinations' => $destinations,
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>