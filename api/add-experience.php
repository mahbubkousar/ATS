<?php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../config/session.php';

requireLogin();

$user = getCurrentUser();
$userId = $user['id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$title = trim($input['title'] ?? '');
$company = trim($input['company'] ?? '');
$location = trim($input['location'] ?? '');
$startDate = $input['start_date'] ?? null;
$endDate = $input['end_date'] ?? null;
$isCurrent = $input['is_current'] ?? false;
$description = trim($input['description'] ?? '');

if (empty($title) || empty($company)) {
    echo json_encode(['success' => false, 'message' => 'Title and company are required']);
    exit();
}

// If current job, set end_date to NULL
if ($isCurrent) {
    $endDate = null;
}

$conn = getDBConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

try {
    $stmt = $conn->prepare("INSERT INTO work_experience (user_id, title, company, location, start_date, end_date, is_current, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssssss", $userId, $title, $company, $location, $startDate, $endDate, $isCurrent, $description);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Experience added successfully',
            'id' => $stmt->insert_id
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add experience']);
    }
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
