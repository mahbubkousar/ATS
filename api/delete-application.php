<?php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../config/session.php';

requireLogin();

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['application_id'])) {
    echo json_encode(['success' => false, 'message' => 'Application ID is required']);
    exit();
}

$user = getCurrentUser();
$userId = $user['id'];
$applicationId = $input['application_id'];

$conn = getDBConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

// Verify ownership before deletion
$stmt = $conn->prepare("DELETE FROM job_applications WHERE application_id = ? AND user_id = ?");
$stmt->bind_param("ii", $applicationId, $userId);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Application deleted successfully!'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Application not found or access denied']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete application']);
}

$stmt->close();
?>
