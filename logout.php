<?php
require_once 'config/session.php';

// Destroy the session
destroyUserSession();

// Redirect to login page
header('Location: login.php');
exit();
?>
