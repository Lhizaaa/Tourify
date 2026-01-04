<?php
/**
 * Create missing tables and finalize setup
 */
require_once __DIR__ . '/../../config/database.php';

$pdo = get_db();

echo "Finalizing setup...\n\n";

// 1. Check ADMIN table
echo "1. Checking ADMIN table...\n";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM ADMIN");
    echo "   ✓ ADMIN table exists\n";
} catch (Exception $e) {
    echo "   ✗ ADMIN table not found\n";
}

// 2. Create ADMINACTIVITYLOG if not exists
echo "\n2. Setting up ADMINACTIVITYLOG table...\n";
try {
    $stmt = $pdo->query("DESCRIBE ADMINACTIVITYLOG");
    echo "   ✓ ADMINACTIVITYLOG table exists\n";
} catch (Exception $e) {
    echo "   Creating ADMINACTIVITYLOG table...\n";
    try {
        $pdo->exec("CREATE TABLE ADMINACTIVITYLOG (
            activity_id INT PRIMARY KEY AUTO_INCREMENT,
            admin_id INT,
            action VARCHAR(255),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB");
        echo "   ✓ ADMINACTIVITYLOG table created\n";
    } catch (Exception $e2) {
        echo "   ✗ Error creating table: " . $e2->getMessage() . "\n";
    }
}

// 3. Verify all key tables
echo "\n3. Verifying all tables...\n";
$tables = ['USERS', 'CATEGORY', 'DESTINATION', 'REVIEW', 'BOOKING', 'ITINERARY', 'ADMIN'];
foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("SELECT 1 FROM $table LIMIT 1");
        echo "   ✓ $table\n";
    } catch (Exception $e) {
        echo "   ✗ $table (missing or error)\n";
    }
}

echo "\n4. Database Statistics:\n";
$tables = [
    'USERS' => 'User accounts',
    'CATEGORY' => 'Destination categories',
    'DESTINATION' => 'Destination records',
    'REVIEW' => 'Reviews & ratings',
    'BOOKING' => 'Bookings',
    'ITINERARY' => 'User itineraries',
    'ADMIN' => 'Admin accounts',
    'ADMINACTIVITYLOG' => 'Activity logs'
];

foreach ($tables as $table => $desc) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
        $count = $stmt->fetch()['count'];
        printf("   %-20s: %4d records (%s)\n", $table, $count, $desc);
    } catch (Exception $e) {
        printf("   %-20s: ERROR\n", $table);
    }
}

echo "\n✓ Setup complete! Database is ready.\n";
echo "\nYou can now access the admin panel:\n";
echo "  URL: http://localhost/Tourify%20V1/admin/\n";
echo "  Menu: Kelola Destinasi\n";
?>