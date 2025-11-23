<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Function to require login (redirect to login page if not logged in)
function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: /ATS/login.php');
        exit();
    }
}

// Function to get current user ID
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

// Function to get current user data
function getCurrentUser() {
    return [
        'id' => $_SESSION['user_id'] ?? null,
        'fullname' => $_SESSION['user_fullname'] ?? null,
        'email' => $_SESSION['user_email'] ?? null
    ];
}

// Function to set user session
function setUserSession($userId, $fullname, $email) {
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_fullname'] = $fullname;
    $_SESSION['user_email'] = $email;
}

// Function to destroy user session
function destroyUserSession() {
    session_unset();
    session_destroy();
}
?>
