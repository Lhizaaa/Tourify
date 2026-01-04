<?php
// Clean up invalid/test destinations
require_once __DIR__ . '/../../config/database.php';

$pdo = get_db();

echo "Cleaning up invalid destinations...\n";

// Delete test data (destinasi dengan name yang aneh seperti "sd", "test", dll)
$invalidNames = ['sd', 'sda', 'test', 'testing', 'dummy'];

$stmt = $pdo->prepare("DELETE FROM DESTINATION WHERE name = ?");

foreach ($invalidNames as $name) {
    try {
        $result = $stmt->execute([$name]);
        if ($stmt->rowCount() > 0) {
            echo "✓ Deleted: $name\n";
        }
    } catch (Exception $e) {
        echo "Error deleting $name: " . $e->getMessage() . "\n";
    }
}

echo "\nVerifying remaining destinations...\n";

// Check remaining
$result = $pdo->query("SELECT COUNT(*) as total FROM DESTINATION");
$total = $result->fetch()['total'];

echo "✓ Total destinations remaining: $total\n";

// Show them
$result = $pdo->query("SELECT destination_id, name, price FROM DESTINATION ORDER BY destination_id");
$dests = $result->fetchAll(PDO::FETCH_ASSOC);

foreach ($dests as $d) {
    echo "  - [{$d['destination_id']}] {$d['name']} (Rp " . number_format($d['price']) . ")\n";
}
?>