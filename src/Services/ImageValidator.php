<?php
/**
 * Verify Database Schema for Image Upload
 */
require_once __DIR__ . '/../../config/database.php';

$pdo = get_db();

echo "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial; max-width: 1000px; margin: 20px auto; }
        .status-ok { color: green; font-weight: bold; }
        .status-error { color: red; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #f0f0f0; }
        .code { background: #f9f9f9; padding: 10px; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <h1>📋 Image Upload System - Database Verification</h1>";

try {
    // Check DESTINATION table
    echo "<h2>1. DESTINATION Table</h2>";
    $stmt = $pdo->query("DESCRIBE DESTINATION");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $imageColumn = null;
    foreach ($columns as $col) {
        if ($col['Field'] === 'image') {
            $imageColumn = $col;
            break;
        }
    }

    if ($imageColumn) {
        echo "<p class='status-ok'>✓ Image column exists</p>";
        echo "<table>";
        echo "<tr><th>Property</th><th>Value</th></tr>";
        foreach ($imageColumn as $key => $value) {
            echo "<tr><td>$key</td><td><span class='code'>$value</span></td></tr>";
        }
        echo "</table>";

        // Check column type
        if (strpos($imageColumn['Type'], 'VARCHAR') !== false) {
            $size = (int) preg_replace('/[^0-9]/', '', $imageColumn['Type']);
            if ($size >= 255) {
                echo "<p class='status-ok'>✓ Column size sufficient ($size chars)</p>";
            } else {
                echo "<p class='status-error'>✗ Column size insufficient ($size chars, need 255+)</p>";
            }
        }
    } else {
        echo "<p class='status-error'>✗ Image column NOT FOUND</p>";
        echo "<p>Please run: <span class='code'>ALTER TABLE DESTINATION ADD COLUMN image VARCHAR(255);</span></p>";
    }

    // Check TourGuide table
    echo "<h2>2. TourGuide Table</h2>";
    $stmt = $pdo->query("DESCRIBE TourGuide");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $profileColumn = null;
    foreach ($columns as $col) {
        if ($col['Field'] === 'profile_picture') {
            $profileColumn = $col;
            break;
        }
    }

    if ($profileColumn) {
        echo "<p class='status-ok'>✓ Profile_picture column exists</p>";
        echo "<table>";
        echo "<tr><th>Property</th><th>Value</th></tr>";
        foreach ($profileColumn as $key => $value) {
            echo "<tr><td>$key</td><td><span class='code'>$value</span></td></tr>";
        }
        echo "</table>";

        // Check column type
        if (strpos($profileColumn['Type'], 'VARCHAR') !== false) {
            $size = (int) preg_replace('/[^0-9]/', '', $profileColumn['Type']);
            if ($size >= 255) {
                echo "<p class='status-ok'>✓ Column size sufficient ($size chars)</p>";
            } else {
                echo "<p class='status-error'>✗ Column size insufficient ($size chars, need 255+)</p>";
            }
        }
    } else {
        echo "<p class='status-error'>✗ Profile_picture column NOT FOUND</p>";
        echo "<p>Please run: <span class='code'>ALTER TABLE TourGuide ADD COLUMN profile_picture VARCHAR(255);</span></p>";
    }

    // Check upload directory
    echo "<h2>3. Upload Directory</h2>";
    $uploadDir = __DIR__ . '/public/assets/uploads/';
    if (is_dir($uploadDir)) {
        echo "<p class='status-ok'>✓ Directory exists: $uploadDir</p>";

        if (is_writable($uploadDir)) {
            echo "<p class='status-ok'>✓ Directory is writable</p>";
        } else {
            echo "<p class='status-error'>✗ Directory is NOT writable</p>";
        }

        // Count files
        $files = glob($uploadDir . '*');
        echo "<p>Files in directory: " . count($files) . "</p>";
        if (count($files) > 0) {
            echo "<table>";
            echo "<tr><th>Filename</th><th>Size</th><th>Date</th></tr>";
            foreach ($files as $file) {
                $name = basename($file);
                $size = filesize($file);
                $date = date('Y-m-d H:i:s', filemtime($file));
                echo "<tr><td>$name</td><td>" . number_format($size) . " bytes</td><td>$date</td></tr>";
            }
            echo "</table>";
        }
    } else {
        echo "<p class='status-error'>✗ Directory does NOT exist: $uploadDir</p>";
        echo "<p>Please create: <span class='code'>mkdir /public/assets/uploads</span></p>";
    }

    // Check API file
    echo "<h2>4. Upload API</h2>";
    $apiFile = __DIR__ . '/api/upload-image.php';
    if (file_exists($apiFile)) {
        echo "<p class='status-ok'>✓ API file exists</p>";
        echo "<p>Size: " . number_format(filesize($apiFile)) . " bytes</p>";
    } else {
        echo "<p class='status-error'>✗ API file NOT FOUND: $apiFile</p>";
    }

    // Summary
    echo "<h2>5. Summary</h2>";
    echo "<ul>";
    echo "<li>Database columns: " . ($imageColumn && $profileColumn ? "<span class='status-ok'>✓ OK</span>" : "<span class='status-error'>✗ MISSING</span>") . "</li>";
    echo "<li>Upload directory: " . (is_dir($uploadDir) && is_writable($uploadDir) ? "<span class='status-ok'>✓ OK</span>" : "<span class='status-error'>✗ ISSUE</span>") . "</li>";
    echo "<li>API file: " . (file_exists($apiFile) ? "<span class='status-ok'>✓ OK</span>" : "<span class='status-error'>✗ MISSING</span>") . "</li>";
    echo "</ul>";

} catch (Exception $e) {
    echo "<p class='status-error'>Error: " . $e->getMessage() . "</p>";
}

echo "</body></html>";
?>