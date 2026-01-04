<?php
/**
 * Database Migration: Add maps_link to DESTINATION table
 * Run this file via browser or command line to update database schema
 */

require_once __DIR__ . '/../../config/database.php';

try {
    $pdo = get_db();

    // Check if maps_link column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM DESTINATION LIKE 'maps_link'");
    $exists = $stmt->rowCount() > 0;

    if ($exists) {
        echo "✓ Field 'maps_link' sudah ada di tabel DESTINATION\n";
        exit;
    }

    // Add maps_link column if it doesn't exist
    $alterQuery = "ALTER TABLE DESTINATION ADD COLUMN maps_link VARCHAR(500) AFTER image";

    if ($pdo->exec($alterQuery)) {
        echo "✅ SUCCESS: Field 'maps_link' berhasil ditambahkan ke tabel DESTINATION\n";
        echo "✓ Status: Database updated to v2 (Google Maps support)\n";
    } else {
        echo "❌ ERROR: Gagal menambahkan field maps_link\n";
        exit(1);
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>