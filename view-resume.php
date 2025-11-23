<?php
require_once 'config/database.php';

// Helper function to show private resume page
function showPrivatePage() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume Not Available</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .error-card {
                background: white;
                border-radius: 16px;
                padding: 3rem;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideIn 0.4s ease-out;
            }
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .icon-wrapper {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
            }
            .icon-wrapper i {
                font-size: 2.5rem;
                color: white;
            }
            h1 {
                color: #1f2937;
                font-size: 1.75rem;
                margin: 0 0 1rem;
            }
            p {
                color: #6b7280;
                font-size: 1rem;
                line-height: 1.6;
                margin: 0 0 2rem;
            }
            .cta-text {
                color: #4b5563;
                font-size: 0.9rem;
                margin: 2rem 0 1.5rem;
                font-weight: 500;
            }
            .btn-container {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 0.875rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
            .btn-secondary {
                background: transparent;
                color: #667eea;
                border: 2px solid #667eea;
                padding: 0.875rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.2s;
            }
            .btn-secondary:hover {
                background: #667eea;
                color: white;
                transform: translateY(-2px);
            }
            .btn-primary i, .btn-secondary i {
                font-size: 1.1rem;
            }
        </style>
    </head>
    <body>
        <div class="error-card">
            <div class="icon-wrapper">
                <i class="fas fa-lock"></i>
            </div>
            <h1>Resume Not Available</h1>
            <p>This resume is currently set to private by the owner. If you believe you should have access to this resume, please contact the owner directly.</p>

            <div class="cta-text">Want to create your own professional resume?</div>

            <div class="btn-container">
                <a href="/ATS/register.php" class="btn-primary">
                    <i class="fas fa-user-plus"></i> Create Your Resume for Free
                </a>
                <a href="/ATS/" class="btn-secondary">
                    <i class="fas fa-home"></i> Go to Homepage
                </a>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit();
}

// Helper function to show not found page
function showNotFoundPage() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume Not Found</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .error-card {
                background: white;
                border-radius: 16px;
                padding: 3rem;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideIn 0.4s ease-out;
            }
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .icon-wrapper {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
            }
            .icon-wrapper i {
                font-size: 2.5rem;
                color: white;
            }
            h1 {
                color: #1f2937;
                font-size: 1.75rem;
                margin: 0 0 1rem;
            }
            p {
                color: #6b7280;
                font-size: 1rem;
                line-height: 1.6;
                margin: 0 0 2rem;
            }
            .cta-text {
                color: #4b5563;
                font-size: 0.9rem;
                margin: 2rem 0 1.5rem;
                font-weight: 500;
            }
            .btn-container {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 0.875rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
            .btn-secondary {
                background: transparent;
                color: #667eea;
                border: 2px solid #667eea;
                padding: 0.875rem 2rem;
                border-radius: 8px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.2s;
            }
            .btn-secondary:hover {
                background: #667eea;
                color: white;
                transform: translateY(-2px);
            }
            .btn-primary i, .btn-secondary i {
                font-size: 1.1rem;
            }
        </style>
    </head>
    <body>
        <div class="error-card">
            <div class="icon-wrapper">
                <i class="fas fa-file-slash"></i>
            </div>
            <h1>Resume Not Found</h1>
            <p>The resume you're looking for doesn't exist or the link may have expired. Please check the URL and try again.</p>

            <div class="cta-text">Why not create your own professional resume?</div>

            <div class="btn-container">
                <a href="/ATS/register.php" class="btn-primary">
                    <i class="fas fa-user-plus"></i> Create Your Resume for Free
                </a>
                <a href="/ATS/" class="btn-secondary">
                    <i class="fas fa-home"></i> Go to Homepage
                </a>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit();
}

$token = $_GET['token'] ?? null;

if (!$token) {
    http_response_code(404);
    showNotFoundPage();
    exit();
}

$conn = getDBConnection();

// First check if resume exists with this token (regardless of public status)
$checkStmt = $conn->prepare("SELECT resume_id, is_public FROM resumes WHERE share_token = ?");
$checkStmt->bind_param("s", $token);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    // Token doesn't exist at all
    $checkStmt->close();
    http_response_code(404);
    showNotFoundPage();
    exit();
}

$checkData = $checkResult->fetch_assoc();
$checkStmt->close();

// Check if resume is private
if ($checkData['is_public'] == 0) {
    http_response_code(403);
    showPrivatePage();
    exit();
}

// Fetch full resume data (only if public)
$stmt = $conn->prepare("SELECT * FROM resumes WHERE share_token = ? AND is_public = 1");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();
$resumeData = $result->fetch_assoc();
$resumeId = $resumeData['resume_id'];
$stmt->close();

// Track view
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
$referer = $_SERVER['HTTP_REFERER'] ?? null;

// Insert view record
$viewStmt = $conn->prepare("INSERT INTO resume_views (resume_id, ip_address, user_agent, referer) VALUES (?, ?, ?, ?)");
$viewStmt->bind_param("isss", $resumeId, $ipAddress, $userAgent, $referer);
$viewStmt->execute();
$viewStmt->close();

// Update view count
$updateStmt = $conn->prepare("UPDATE resumes SET view_count = view_count + 1, last_viewed_at = NOW() WHERE resume_id = ?");
$updateStmt->bind_param("i", $resumeId);
$updateStmt->execute();
$updateStmt->close();

// Get user data for resume
$userId = $resumeData['user_id'];

// Load experience
$experienceStmt = $conn->prepare("SELECT * FROM user_experience WHERE user_id = ? ORDER BY display_order");
$experienceStmt->bind_param("i", $userId);
$experienceStmt->execute();
$experienceResult = $experienceStmt->get_result();
$experience = [];
while ($row = $experienceResult->fetch_assoc()) {
    $experience[] = $row;
}
$experienceStmt->close();

// Load education
$educationStmt = $conn->prepare("SELECT * FROM user_education WHERE user_id = ? ORDER BY display_order");
$educationStmt->bind_param("i", $userId);
$educationStmt->execute();
$educationResult = $educationStmt->get_result();
$education = [];
while ($row = $educationResult->fetch_assoc()) {
    $education[] = $row;
}
$educationStmt->close();

// Load skills
$skillsStmt = $conn->prepare("SELECT skill_name FROM user_skills WHERE user_id = ? ORDER BY display_order");
$skillsStmt->bind_param("i", $userId);
$skillsStmt->execute();
$skillsResult = $skillsStmt->get_result();
$skills = [];
while ($row = $skillsResult->fetch_assoc()) {
    $skills[] = $row['skill_name'];
}
$skillsStmt->close();

$personalDetails = json_decode($resumeData['personal_details'], true) ?? [];
$summaryText = $resumeData['summary_text'] ?? '';
$templateName = $resumeData['template_name'] ?? 'classic';

// Load template
$templatePath = __DIR__ . '/templates/' . $templateName . '.html';
if (!file_exists($templatePath)) {
    $templatePath = __DIR__ . '/templates/classic.html';
}
$templateHTML = file_get_contents($templatePath);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($resumeData['resume_title']); ?> - <?php echo htmlspecialchars($personalDetails['fullName'] ?? 'Resume'); ?></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background: #f3f4f6;
        }
        .public-header {
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .public-header h1 {
            margin: 0;
            font-size: 1.25rem;
            color: #7c3aed;
        }
        .download-btn {
            background: #7c3aed;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .download-btn:hover {
            background: #6d28d9;
        }
        .resume-wrapper {
            max-width: 900px;
            margin: 2rem auto;
            background: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        @media print {
            body { background: white; }
            .public-header { display: none; }
            .resume-wrapper {
                max-width: none;
                margin: 0;
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="public-header">
        <h1><i class="fas fa-file-alt"></i> Public Resume</h1>
        <button class="download-btn" onclick="handleDownload()">
            <i class="fas fa-download"></i> Download PDF
        </button>
    </div>

    <div class="resume-wrapper" id="resumeContent">
        <?php echo $templateHTML; ?>
    </div>

    <script>
        const resumeToken = '<?php echo $token; ?>';
        const resumeId = <?php echo $resumeId; ?>;

        // Track download
        function handleDownload() {
            // Track download via API
            fetch('/ATS/api/track-download.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ resume_id: resumeId })
            }).then(() => {
                // Trigger print dialog
                window.print();
            }).catch(err => {
                console.error('Failed to track download:', err);
                // Still allow print even if tracking fails
                window.print();
            });
        }

        // Populate template with data
        document.addEventListener('DOMContentLoaded', () => {
            const personalDetails = <?php echo json_encode($personalDetails); ?>;
            const summary = <?php echo json_encode($summaryText); ?>;
            const experience = <?php echo json_encode($experience); ?>;
            const education = <?php echo json_encode($education); ?>;
            const skills = <?php echo json_encode($skills); ?>;

            // Populate personal fields
            Object.keys(personalDetails).forEach(key => {
                const elements = document.querySelectorAll(`[data-field="${key}"]`);
                elements.forEach(el => {
                    el.textContent = personalDetails[key] || '';
                });
            });

            // Populate summary
            const summaryEl = document.querySelector('[data-field="summary"]');
            if (summaryEl) summaryEl.textContent = summary;

            // Populate experience
            const expContainer = document.querySelector('[data-field="experience"]');
            if (expContainer && experience.length > 0) {
                expContainer.innerHTML = '';
                experience.forEach(exp => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'entry';

                    let html = '<div class="entry-header">';
                    html += '<div class="entry-title-line">';
                    html += `<div class="entry-title">${exp.job_title || ''}</div>`;
                    html += `<div class="entry-date">${exp.start_date || ''} - ${exp.end_date || ''}</div>`;
                    html += '</div>';
                    html += `<div class="entry-company">${exp.company_name || ''}${exp.location ? ', ' + exp.location : ''}</div>`;
                    html += '</div>';

                    if (exp.description) {
                        html += '<div class="entry-description"><ul>';
                        const bullets = exp.description.split('\n').filter(line => line.trim());
                        bullets.forEach(bullet => {
                            html += `<li>${bullet}</li>`;
                        });
                        html += '</ul></div>';
                    }

                    entryDiv.innerHTML = html;
                    expContainer.appendChild(entryDiv);
                });
            }

            // Populate education
            const eduContainer = document.querySelector('[data-field="education"]');
            if (eduContainer && education.length > 0) {
                eduContainer.innerHTML = '';
                education.forEach(edu => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'entry';

                    let html = '<div class="entry-header">';
                    html += '<div class="entry-title-line">';
                    html += `<div class="entry-title">${edu.degree || ''}</div>`;
                    html += `<div class="entry-date">${edu.start_date || ''} - ${edu.end_date || ''}</div>`;
                    html += '</div>';
                    html += `<div class="entry-company">${edu.institution || ''}${edu.location ? ', ' + edu.location : ''}</div>`;
                    html += '</div>';

                    entryDiv.innerHTML = html;
                    eduContainer.appendChild(entryDiv);
                });
            }

            // Populate skills
            const skillsContainer = document.querySelector('[data-field="skills"]');
            if (skillsContainer && skills.length > 0) {
                skillsContainer.innerHTML = '';
                skills.forEach(skill => {
                    const skillSpan = document.createElement('span');
                    skillSpan.className = 'skill-item';
                    skillSpan.textContent = skill;
                    skillsContainer.appendChild(skillSpan);
                });
            }
        });
    </script>
</body>
</html>
