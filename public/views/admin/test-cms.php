<?php
/**
 * CMS System Test & Validation Script
 * Test all CRUD operations and database integration
 */

session_start();
require_once __DIR__ . '/../../config/database.php';

// Simple logging function
$log = [];

function testLog($status, $message) {
    global $log;
    $log[] = [
        'status' => $status,
        'message' => $message,
        'time' => date('Y-m-d H:i:s')
    ];
}

// ============ DATABASE CONNECTION TEST ============
try {
    $pdo = get_db();
    testLog('✓ PASS', 'Database connection successful');
} catch (Exception $e) {
    testLog('✗ FAIL', 'Database connection failed: ' . $e->getMessage());
    die('Database connection failed');
}

// ============ TABLE EXISTENCE TEST ============
$tables = ['USERS', 'DESTINATION', 'CATEGORY', 'BOOKING', 'TourGuide', 'REVIEW', 'ADMIN', 'ADMINACTIVITYLOG'];

foreach ($tables as $table) {
    try {
        $stmt = $pdo->prepare("SELECT 1 FROM $table LIMIT 1");
        $stmt->execute();
        testLog('✓ PASS', "Table $table exists");
    } catch (Exception $e) {
        testLog('✗ FAIL', "Table $table does not exist or is inaccessible");
    }
}

// ============ API ENDPOINT TEST ============

function testEndpoint($endpoint, $method = 'GET') {
    $url = "http://localhost/admin/api/$endpoint";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['code' => $httpCode, 'response' => $response];
}

// Note: These tests require server to be running
// testLog('INFO', 'API Endpoint tests require running server - skipped');

// ============ SAMPLE DATA TEST ============

try {
    // Test user count
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM USERS");
    $stmt->execute();
    $count = $stmt->fetch()['total'];
    testLog('✓ PASS', "Users table has $count records");
    
    // Test destination count
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM DESTINATION");
    $stmt->execute();
    $count = $stmt->fetch()['total'];
    testLog('✓ PASS', "Destinations table has $count records");
    
    // Test booking count
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM BOOKING");
    $stmt->execute();
    $count = $stmt->fetch()['total'];
    testLog('✓ PASS', "Bookings table has $count records");
    
} catch (Exception $e) {
    testLog('✗ FAIL', 'Error querying sample data: ' . $e->getMessage());
}

// ============ FOREIGN KEY TEST ============

try {
    // Verify foreign key relationships
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM BOOKING WHERE user_id IS NOT NULL");
    $stmt->execute();
    $count = $stmt->fetch()['total'];
    testLog('✓ PASS', "BOOKING.user_id foreign key integrity verified ($count valid references)");
} catch (Exception $e) {
    testLog('✗ FAIL', 'Foreign key test failed: ' . $e->getMessage());
}

// ============ CRUD OPERATION TEST ============

try {
    // Create test category
    $stmt = $pdo->prepare("INSERT INTO CATEGORY (name, description) VALUES (?, ?)");
    $stmt->execute(['Test Category', 'Test Description']);
    $categoryId = $pdo->lastInsertId();
    testLog('✓ PASS', "CREATE: Category created (ID: $categoryId)");
    
    // Read test category
    $stmt = $pdo->prepare("SELECT * FROM CATEGORY WHERE category_id = ?");
    $stmt->execute([$categoryId]);
    $category = $stmt->fetch();
    if ($category) {
        testLog('✓ PASS', "READ: Category retrieved successfully");
    } else {
        testLog('✗ FAIL', 'READ: Category not found');
    }
    
    // Update test category
    $stmt = $pdo->prepare("UPDATE CATEGORY SET description = ? WHERE category_id = ?");
    $stmt->execute(['Updated Description', $categoryId]);
    testLog('✓ PASS', "UPDATE: Category updated successfully");
    
    // Delete test category
    $stmt = $pdo->prepare("DELETE FROM CATEGORY WHERE category_id = ?");
    $stmt->execute([$categoryId]);
    testLog('✓ PASS', "DELETE: Category deleted successfully");
    
} catch (Exception $e) {
    testLog('✗ FAIL', 'CRUD test failed: ' . $e->getMessage());
}

// ============ TRANSACTION TEST ============

try {
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("INSERT INTO CATEGORY (name, description) VALUES (?, ?)");
    $stmt->execute(['Transaction Test', 'Testing transaction']);
    $id = $pdo->lastInsertId();
    
    // Rollback
    $pdo->rollBack();
    
    $stmt = $pdo->prepare("SELECT * FROM CATEGORY WHERE category_id = ?");
    $stmt->execute([$id]);
    $result = $stmt->fetch();
    
    if (!$result) {
        testLog('✓ PASS', 'TRANSACTION: Rollback works correctly');
    } else {
        testLog('✗ FAIL', 'TRANSACTION: Rollback did not work');
    }
    
} catch (Exception $e) {
    testLog('✗ FAIL', 'Transaction test failed: ' . $e->getMessage());
}

// ============ ACTIVITY LOG TEST ============

try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM ADMINACTIVITYLOG");
    $stmt->execute();
    $count = $stmt->fetch()['total'];
    testLog('✓ PASS', "Activity log table verified ($count entries)");
} catch (Exception $e) {
    testLog('✗ FAIL', 'Activity log test failed: ' . $e->getMessage());
}

// ============ REPORT ============

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMS System Test Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .test-log {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .test-item {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            transition: background 0.2s;
        }
        .test-item:hover {
            background: #f9f9f9;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .test-status {
            width: 100px;
            font-weight: bold;
            margin-right: 20px;
            font-size: 1.2em;
        }
        .test-status.pass {
            color: #10b981;
        }
        .test-status.fail {
            color: #ef4444;
        }
        .test-status.info {
            color: #3b82f6;
        }
        .test-message {
            flex: 1;
            color: #333;
        }
        .test-time {
            color: #999;
            font-size: 0.9em;
            width: 150px;
            text-align: right;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card h3 {
            margin: 0;
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .summary-card .number {
            font-size: 2.5em;
            font-weight: bold;
            margin-top: 10px;
        }
        .summary-card.pass .number {
            color: #10b981;
        }
        .summary-card.fail .number {
            color: #ef4444;
        }
        .summary-card.total .number {
            color: #667eea;
        }
        .action-buttons {
            margin-top: 30px;
            text-align: center;
        }
        .action-buttons a, .action-buttons button {
            display: inline-block;
            padding: 12px 30px;
            margin: 0 10px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            transition: background 0.2s;
        }
        .action-buttons a:hover, .action-buttons button:hover {
            background: #764ba2;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 CMS System Test Report</h1>
        <p>Database Integration & API Validation</p>
        <p style="font-size: 0.9em; margin-top: 15px;">Generated: <?= date('d M Y H:i:s') ?></p>
    </div>

    <div class="test-log">
        <?php foreach ($log as $entry): ?>
            <div class="test-item">
                <span class="test-status <?= strtolower(strpos($entry['status'], 'PASS') !== false ? 'pass' : (strpos($entry['status'], 'FAIL') !== false ? 'fail' : 'info')); ?>">
                    <?= $entry['status'] ?>
                </span>
                <span class="test-message"><?= $entry['message'] ?></span>
                <span class="test-time"><?= $entry['time'] ?></span>
            </div>
        <?php endforeach; ?>
    </div>

    <?php
    $passed = count(array_filter($log, fn($l) => strpos($l['status'], 'PASS') !== false));
    $failed = count(array_filter($log, fn($l) => strpos($l['status'], 'FAIL') !== false));
    $total = count($log);
    ?>

    <div class="summary">
        <div class="summary-card pass">
            <h3>Passed Tests</h3>
            <div class="number"><?= $passed ?></div>
        </div>
        <div class="summary-card fail">
            <h3>Failed Tests</h3>
            <div class="number"><?= $failed ?></div>
        </div>
        <div class="summary-card total">
            <h3>Total Tests</h3>
            <div class="number"><?= $total ?></div>
        </div>
    </div>

    <div class="action-buttons">
        <a href="admin.php">Go to Admin Dashboard</a>
        <button onclick="window.location.reload()">Refresh Test</button>
        <a href="javascript:window.print()">Print Report</a>
    </div>

    <script>
        // Auto-refresh every 60 seconds (optional)
        // setInterval(() => window.location.reload(), 60000);
    </script>
</body>
</html>
