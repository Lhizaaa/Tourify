<?php
/**
 * Database Setup Script
 * Run this file once to create tables in phpMyAdmin
 * Access: http://localhost/setup-database.php
 */

// Local phpMyAdmin connection (XAMPP default)
$DB_HOST = 'localhost';
$DB_USER = 'root';  // Default XAMPP root user
$DB_PASS = '';      // Default XAMPP has no password
$DB_NAME = 'tourify';

try {
    // Connect to MySQL without selecting a database first
    $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS);

    if ($conn->connect_error) {
        die('Connection failed: ' . $conn->connect_error);
    }

    // Read schema.sql
    $sql = file_get_contents(__DIR__ . '/schema.sql');

    // Execute all SQL statements
    if ($conn->multi_query($sql)) {
        echo '<h2 style="color: green;">✓ Database setup successful!</h2>';
        echo '<p>All tables created in "tourify" database.</p>';
        echo '<p><a href="http://localhost/phpmyadmin" target="_blank">Open phpMyAdmin</a></p>';
    } else {
        echo '<h2 style="color: red;">✗ Error executing SQL:</h2>';
        echo '<p>' . $conn->error . '</p>';
    }

    $conn->close();

} catch (Exception $e) {
    echo '<h2 style="color: red;">✗ Connection Error:</h2>';
    echo '<p>' . $e->getMessage() . '</p>';
    echo '<p><strong>Make sure XAMPP MySQL is running!</strong></p>';
}
?>