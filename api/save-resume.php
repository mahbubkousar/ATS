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

$resumeId = $input['resume_id'] ?? null;
$resumeTitle = trim($input['resume_title'] ?? '');
$templateName = $input['template_name'] ?? 'classic';
$personalDetails = json_encode($input['personal_details'] ?? []);
$summaryText = $input['summary_text'] ?? '';
$status = $input['status'] ?? 'draft';

if (empty($resumeTitle)) {
    echo json_encode(['success' => false, 'message' => 'Resume title is required']);
    exit();
}

$conn = getDBConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

try {
    if ($resumeId) {
        // Update existing resume
        $stmt = $conn->prepare("UPDATE resumes SET resume_title = ?, template_name = ?, personal_details = ?, summary_text = ?, status = ?, updated_at = NOW() WHERE resume_id = ? AND user_id = ?");
        $stmt->bind_param("sssssii", $resumeTitle, $templateName, $personalDetails, $summaryText, $status, $resumeId, $userId);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Resume updated successfully',
                'resume_id' => $resumeId
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update resume']);
        }
        $stmt->close();
    } else {
        // Create new resume
        $stmt = $conn->prepare("INSERT INTO resumes (user_id, resume_title, template_name, personal_details, summary_text, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", $userId, $resumeTitle, $templateName, $personalDetails, $summaryText, $status);

        if ($stmt->execute()) {
            $newResumeId = $stmt->insert_id;
            echo json_encode([
                'success' => true,
                'message' => 'Resume created successfully',
                'resume_id' => $newResumeId
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to create resume']);
        }
        $stmt->close();
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
