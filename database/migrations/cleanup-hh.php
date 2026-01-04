<?php
require_once __DIR__ . '/../../config/database.php';

$pdo = get_db();

echo "Deleting test data 'hh'...\n";

$stmt = $pdo->prepare('DELETE FROM DESTINATION WHERE name = ?');
$stmt->execute(['hh']);

echo "Deleted: " . $stmt->rowCount() . " rows\n";

// Get total
$total = $pdo->query('SELECT COUNT(*) as c FROM DESTINATION')->fetch()['c'];
echo "Total destinations remaining: " . $total . "\n\n";

// List remaining
$result = $pdo->query("SELECT destination_id, name, price FROM DESTINATION ORDER BY destination_id");
echo "Remaining destinations:\n";
foreach ($result as $d) {
    echo "  [{$d['destination_id']}] {$d['name']} - Rp " . number_format($d['price']) . "\n";
}
?>