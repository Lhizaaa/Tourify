<?php
/**
 * Verify DESTINATION table structure
 */

require_once __DIR__ . '/db.php';

try {
    $pdo = get_db();

    echo "=== DESTINATION Table Structure ===\n";
    $stmt = $pdo->query("SHOW COLUMNS FROM DESTINATION");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($columns as $col) {
        echo $col['Field'] . " | " . $col['Type'] . " | " . ($col['Null'] === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
    }

    echo "\n=== Recent Destinations (Last 5) ===\n";
    $stmt = $pdo->query("SELECT destination_id, name, status, facilities FROM DESTINATION ORDER BY destination_id DESC LIMIT 5");
    $dests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($dests as $dest) {
        echo "ID: {$dest['destination_id']}, Name: {$dest['name']}, Status: {$dest['status']}, Facilities: {$dest['facilities']}\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>