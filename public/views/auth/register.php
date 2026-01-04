<?php
require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($name === '' || $email === '' || $password === '') {
        header('Location: auth.php?register=error');
        exit;
    }

    $pdo = get_db();

    // Check existing email
    $stmt = $pdo->prepare('SELECT user_id FROM USERS WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) {
        header('Location: auth.php?register=exists');
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO USERS (name, email, password, phone) VALUES (:name, :email, :password, :phone)');
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':password' => $hashed,
        ':phone' => $phone
    ]);

    header('Location: auth.php?register=success');
    exit;
}

// if not POST, redirect to auth page
header('Location: auth.php');
exit;
