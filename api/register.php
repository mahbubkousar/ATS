<?php
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../config/session.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields (Step 1 & 2)
$required = ['fullname', 'email', 'password', 'phone', 'address', 'city', 'state', 'zipcode', 'country'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        echo json_encode(['success' => false, 'message' => "Field '{$field}' is required"]);
        exit();
    }
}

// Validate email format
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Validate password strength (minimum 8 characters)
if (strlen($input['password']) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
    exit();
}

$conn = getDBConnection();
if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

// Check if email already exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $input['email']);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    $stmt->close();
    exit();
}
$stmt->close();

// Hash password
$hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);

// Insert user - using actual database column names
$stmt = $conn->prepare("INSERT INTO users (full_name, email, password_hash, phone, date_of_birth, address_line1, city, state, zip_code, country, professional_title, professional_summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$dob = !empty($input['dob']) ? $input['dob'] : null;
$professionalTitle = $input['professional-title'] ?? null;
$bio = $input['bio'] ?? null;

$stmt->bind_param(
    "ssssssssssss",
    $input['fullname'],
    $input['email'],
    $hashedPassword,
    $input['phone'],
    $dob,
    $input['address'],
    $input['city'],
    $input['state'],
    $input['zipcode'],
    $input['country'],
    $professionalTitle,
    $bio
);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
    $stmt->close();
    exit();
}

$userId = $stmt->insert_id;
$stmt->close();

// Insert education records if provided
if (!empty($input['education']) && is_array($input['education'])) {
    $stmt = $conn->prepare("INSERT INTO user_education (user_id, institution_name, degree, field_of_study, start_date, end_date, gpa) VALUES (?, ?, ?, ?, ?, ?, ?)");

    foreach ($input['education'] as $edu) {
        if (!empty($edu['institution']) || !empty($edu['degree'])) {
            $startDate = !empty($edu['startDate']) ? $edu['startDate'] . '-01' : null;
            $endDate = !empty($edu['endDate']) ? $edu['endDate'] . '-01' : null;

            $stmt->bind_param(
                "issssss",
                $userId,
                $edu['institution'] ?? null,
                $edu['degree'] ?? null,
                $edu['field'] ?? null,
                $startDate,
                $endDate,
                $edu['gpa'] ?? null
            );
            $stmt->execute();
        }
    }
    $stmt->close();
}

// Insert work experience records if provided
if (!empty($input['experience']) && is_array($input['experience'])) {
    $stmt = $conn->prepare("INSERT INTO user_experience (user_id, company_name, job_title, location, start_date, end_date, current_position, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    foreach ($input['experience'] as $exp) {
        if (!empty($exp['company']) || !empty($exp['title'])) {
            $startDate = !empty($exp['startDate']) ? $exp['startDate'] . '-01' : null;
            $endDate = !empty($exp['endDate']) ? $exp['endDate'] . '-01' : null;
            $isCurrent = isset($exp['current']) && $exp['current'] ? 1 : 0;

            $stmt->bind_param(
                "isssssss",
                $userId,
                $exp['company'] ?? null,
                $exp['title'] ?? null,
                $exp['location'] ?? null,
                $startDate,
                $endDate,
                $isCurrent,
                $exp['description'] ?? null
            );
            $stmt->execute();
        }
    }
    $stmt->close();
}

// Get user data for session
$stmt = $conn->prepare("SELECT user_id, full_name, email FROM users WHERE user_id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();
$stmt->close();

// Set user session
setUserSession($user['user_id'], $user['full_name'], $user['email']);

echo json_encode([
    'success' => true,
    'message' => 'Registration successful!',
    'redirect' => 'dashboard.php'
]);
?>
