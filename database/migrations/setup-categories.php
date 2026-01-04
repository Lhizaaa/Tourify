<?php
/**
 * Setup default categories jika belum ada
 */
session_start();
require_once __DIR__ . '/../../config/database.php';

$pdo = get_db();

// Check if admin logged in
if (!isset($_SESSION['admin_id'])) {
    echo '<h3>Admin login required</h3>';
    exit;
}

echo '<h2>Setup Default Categories</h2>';

// Default categories
$categories = [
    ['name' => 'Pegunungan', 'description' => 'Destinasi wisata dengan pemandangan pegunungan'],
    ['name' => 'Danau', 'description' => 'Destinasi wisata dengan danau indah'],
    ['name' => 'Air Terjun', 'description' => 'Destinasi wisata dengan air terjun'],
    ['name' => 'Candi Bersejarah', 'description' => 'Situs candi dan warisan budaya'],
    ['name' => 'Pantai', 'description' => 'Destinasi wisata pantai'],
    ['name' => 'Goa Alam', 'description' => 'Goa dan tebing alami'],
    ['name' => 'Perkebunan', 'description' => 'Destinasi agro-wisata'],
    ['name' => 'Taman Nasional', 'description' => 'Taman nasional dan cagar alam']
];

// Check existing categories
$stmt = $pdo->query("SELECT COUNT(*) as count FROM CATEGORY");
$result = $stmt->fetch();
$categoryCount = $result['count'];

echo "<p>Current categories: <strong>$categoryCount</strong></p>";

if ($categoryCount == 0) {
    echo "<h3>Inserting default categories...</h3>";
    $count = 0;
    foreach ($categories as $cat) {
        try {
            $stmt = $pdo->prepare("INSERT INTO CATEGORY (name, description) VALUES (?, ?)");
            $stmt->execute([$cat['name'], $cat['description']]);
            echo "<p>✓ Added: " . htmlspecialchars($cat['name']) . "</p>";
            $count++;
        } catch (Exception $e) {
            echo "<p>✗ Error adding " . htmlspecialchars($cat['name']) . ": " . htmlspecialchars($e->getMessage()) . "</p>";
        }
    }
    echo "<h3>Done! Added $count categories.</h3>";
} else {
    echo "<h3>Categories already exist</h3>";
    echo "<p>List of current categories:</p>";
    $stmt = $pdo->query("SELECT * FROM CATEGORY ORDER BY category_id");
    while ($row = $stmt->fetch()) {
        echo "<p>" . htmlspecialchars($row['name']) . "</p>";
    }
}

echo "<hr>";
echo "<p><a href='admin/admin.php'>← Back to Admin Panel</a></p>";
?>