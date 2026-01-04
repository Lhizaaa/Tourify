<?php
ob_clean();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config/database.php';

$pdo = get_db();

try {
    // Update dengan correct filenames
    $updates = [
        8 => 'hero-dieng-plateau.jpg',
        9 => 'destination-telaga-warna.jpg',
        10 => 'destination-kawah-sikidang.jpg',
        11 => 'destination-candi-arjuna.jpg',
        12 => 'destination-bukit-sikunir.jpg',
        13 => 'destination-air-terjun-pekasaran.jpg',
    ];

    $updated = 0;
    foreach ($updates as $id => $filename) {
        $stmt = $pdo->prepare("UPDATE DESTINATION SET image = ? WHERE destination_id = ?");
        if ($stmt->execute([$filename, $id])) {
            $updated++;
        }
    }

    // Verify
    $stmt = $pdo->prepare("SELECT destination_id, name, image FROM DESTINATION WHERE destination_id IN (8,9,10,11,12,13)");
    $stmt->execute();
    $dests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Check file existence
    foreach ($dests as &$d) {
        $path = __DIR__ . '/public/assets/uploads/' . $d['image'];
        $d['file_exists'] = file_exists($path);
        $d['image_url'] = '/Tourify V1/public/assets/uploads/' . $d['image'];
    }

    echo json_encode([
        'success' => true,
        'updated' => $updated,
        'destinations' => $dests,
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>