<?php
// Debug script - Check reviews in database
session_start();
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h2>Debug: Review System</h2>";

// 1. Check current session
echo "<h3>1. Current Session:</h3>";
echo "Session user_id: " . ($_SESSION['user_id'] ?? 'NOT SET') . "<br>";
echo "Session user_name: " . ($_SESSION['user_name'] ?? 'NOT SET') . "<br>";
echo "Session user_email: " . ($_SESSION['user_email'] ?? 'NOT SET') . "<br>";
echo "<pre>Full Session: " . json_encode($_SESSION, JSON_PRETTY_PRINT) . "</pre>";

// 2. Check all users
echo "<h3>2. All Users in Database:</h3>";
try {
    $db = get_db();
    $stmt = $db->query("SELECT user_id, name, email FROM USERS ORDER BY user_id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . json_encode($users, JSON_PRETTY_PRINT) . "</pre>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

// 3. Check all reviews
echo "<h3>3. All Reviews in Database:</h3>";
try {
    $db = get_db();
    $stmt = $db->query("SELECT 
        r.review_id, 
        r.user_id, 
        r.destination_id, 
        r.rating, 
        r.review_text, 
        r.created_at,
        u.name as user_name,
        d.name as destination_name
    FROM REVIEW r
    LEFT JOIN USERS u ON r.user_id = u.user_id
    LEFT JOIN DESTINATION d ON r.destination_id = d.destination_id
    ORDER BY r.created_at DESC");
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . json_encode($reviews, JSON_PRETTY_PRINT) . "</pre>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

// 4. Check reviews for current logged-in user
if (isset($_SESSION['user_id'])) {
    echo "<h3>4. Reviews for Current User (ID: " . $_SESSION['user_id'] . "):</h3>";
    try {
        $db = get_db();
        $stmt = $db->prepare("SELECT 
            r.review_id, 
            r.user_id, 
            r.destination_id, 
            r.rating, 
            r.review_text, 
            r.created_at,
            d.name as destination_name
        FROM REVIEW r
        LEFT JOIN DESTINATION d ON r.destination_id = d.destination_id
        WHERE r.user_id = :user_id
        ORDER BY r.created_at DESC");
        $stmt->execute([':user_id' => $_SESSION['user_id']]);
        $userReviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<pre>" . json_encode($userReviews, JSON_PRETTY_PRINT) . "</pre>";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
    }
}

echo "<hr>";
echo "<a href='profile.php'>Back to Profile</a>";
?>