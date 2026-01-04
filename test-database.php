<?php
/**
 * Database Connection Test
 * 
 * This script tests if the database connection works properly.
 * Run this to verify your database setup before starting the application.
 */

// Define paths
define('ROOT_PATH', __DIR__);
define('CONFIG_PATH', ROOT_PATH . '/config');

// Load database config
require_once ROOT_PATH . '/config/database.php';

// Start testing
echo "=== TourifyV2 Database Connection Test ===\n\n";

// 1. Check if PDO connection exists
echo "1. Testing PDO Connection...\n";
try {
    if (isset($pdo) && $pdo instanceof PDO) {
        echo "   ✓ PDO connection successful\n";
    } else {
        echo "   ✗ PDO connection failed\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

// 2. Test a simple query
echo "\n2. Testing Simple Query...\n";
try {
    $result = $pdo->query("SELECT 1 as test");
    if ($result) {
        echo "   ✓ Simple query executed\n";
    } else {
        echo "   ✗ Query execution failed\n";
        exit(1);
    }
} catch (PDOException $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

// 3. Check database name
echo "\n3. Checking Database Name...\n";
try {
    $result = $pdo->query("SELECT DATABASE() as db_name");
    $row = $result->fetch();
    echo "   ✓ Connected to database: " . $row['db_name'] . "\n";
} catch (PDOException $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

// 4. Check for required tables
echo "\n4. Checking for Required Tables...\n";
try {
    $result = $pdo->query("SHOW TABLES");
    $tables = $result->fetchAll(PDO::FETCH_COLUMN);
    
    if (!empty($tables)) {
        echo "   ✓ Database has " . count($tables) . " table(s)\n";
        echo "   Tables: " . implode(", ", $tables) . "\n";
    } else {
        echo "   ⚠ Database is empty (no tables found)\n";
        echo "   Run migrations to set up database schema:\n";
        echo "   php database/migrations/setup-database.php\n";
    }
} catch (PDOException $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

// 5. Test prepared statements
echo "\n5. Testing Prepared Statements...\n";
try {
    $stmt = $pdo->prepare("SELECT ? as test_value");
    $stmt->execute(["Hello TourifyV2"]);
    $row = $stmt->fetch();
    echo "   ✓ Prepared statement works: " . $row['test_value'] . "\n";
} catch (PDOException $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

// 6. Test error handling
echo "\n6. Testing Error Handling...\n";
try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "   ✓ Error mode set to EXCEPTION\n";
} catch (PDOException $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n=== ✓ All Database Tests Passed! ===\n";
echo "\nYour database connection is working correctly.\n";
echo "You can now run the application.\n";
echo "\nTo start the development server:\n";
echo "  php -S localhost:8000 -t public/\n";
echo "\nThen visit: http://localhost:8000\n";
?>
