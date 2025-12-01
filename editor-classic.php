<?php
require_once 'config/session.php';
require_once 'config/database.php';
requireLogin();

$user = getCurrentUser();
$conn = getDBConnection();

// Get resume ID from URL
$resumeId = $_GET['id'] ?? null;
$templateName = 'classic'; // Fixed template for this editor

// Load existing resume data if editing
$resumeData = null;
if ($resumeId) {
    $stmt = $conn->prepare("SELECT * FROM resumes WHERE resume_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $resumeId, $user['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $resumeData = $result->fetch_assoc();
    }
    $stmt->close();
}

// Get user data for new resume
$personalDetails = [];
if (!$resumeData) {
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
    if ($stmt) {
        $stmt->bind_param("i", $user['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $userData = $result->fetch_assoc();
            $personalDetails = [
                'fullName' => $userData['full_name'] ?? '',
                'email' => $userData['email'] ?? '',
                'phone' => $userData['phone'] ?? '',
                'location' => ($userData['city'] ?? '') . ($userData['state'] ? ', ' . $userData['state'] : ''),
                'professionalTitle' => $userData['professional_title'] ?? '',
                'linkedin' => ''
            ];
        }
        $stmt->close();
    }
} else {
    $personalDetails = json_decode($resumeData['personal_details'], true) ?? [];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classic Resume Editor - ResumeSync</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css?v=4">
    <link rel="stylesheet" href="css/editor.css?v=11">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body class="editor-body">
    <nav class="floating-nav">
        <div class="nav-content">
            <a href="index.html" class="nav-logo" style="text-decoration: none; color: inherit;">ResumeSync</a>
            <div class="nav-links">
                <a href="dashboard.php" class="nav-link">Dashboard</a>
                <a href="score-checker.php" class="nav-link">ATS Checker</a>
                <a href="about.html" class="nav-link">About</a>
                <button class="nav-cta" id="saveResumeBtn">Save Resume</button>
                <button class="nav-cta download-btn" id="downloadBtn">Download PDF</button>
            </div>
        </div>
    </nav>

    <div class="editor-container">
        <!-- Left Sidebar: Resume Form -->
        <aside class="editor-sidebar left-sidebar">
            <div class="editor-mode-switch">
                <a href="ai-editor.php" class="mode-switch-btn">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Try AI Editor</span>
                </a>
            </div>
            
            <h2 class="sidebar-section-title">Classic Resume</h2>

            <!-- Resume Title -->
            <div class="form-section">
                <h3 class="form-section-title">Resume Title</h3>
                <input type="text" class="form-input" id="resumeTitle" placeholder="e.g., Software Engineer Resume" value="<?php echo htmlspecialchars($resumeData['resume_title'] ?? ''); ?>">
            </div>

            <!-- Template Display (Locked) -->
            <div class="form-section">
                <h3 class="form-section-title">Template</h3>
                <div class="locked-template-display">
                    <span class="template-icon"><i class="fa-solid fa-file-lines"></i></span>
                    <span id="currentTemplateName">Classic</span>
                    <span class="locked-badge"><i class="fa-solid fa-lock"></i> Locked</span>
                </div>
            </div>

            <!-- Personal Details -->
            <div class="form-section">
                <h3 class="form-section-title"><i class="fa-solid fa-user"></i> Personal Details</h3>
                <input type="text" class="form-input" id="fullName" placeholder="Full Name" value="<?php echo htmlspecialchars($personalDetails['fullName'] ?? ''); ?>">
                <input type="text" class="form-input" id="professionalTitle" placeholder="Professional Title" value="<?php echo htmlspecialchars($personalDetails['professionalTitle'] ?? ''); ?>">
                <input type="email" class="form-input" id="email" placeholder="Email" value="<?php echo htmlspecialchars($personalDetails['email'] ?? ''); ?>">
                <input type="tel" class="form-input" id="phone" placeholder="Phone" value="<?php echo htmlspecialchars($personalDetails['phone'] ?? ''); ?>">
                <input type="text" class="form-input" id="location" placeholder="Location" value="<?php echo htmlspecialchars($personalDetails['location'] ?? ''); ?>">
                <input type="text" class="form-input" id="linkedin" placeholder="LinkedIn URL" value="<?php echo htmlspecialchars($personalDetails['linkedin'] ?? ''); ?>">
            </div>

            <!-- Professional Summary -->
            <div class="form-section">
                <h3 class="form-section-title"><i class="fa-solid fa-align-left"></i> Professional Summary</h3>
                <textarea class="form-textarea" id="summary" placeholder="Write your professional summary..." rows="6"><?php echo htmlspecialchars($resumeData['summary_text'] ?? ''); ?></textarea>
            </div>

            <!-- Experience -->
            <div class="form-section">
                <h3 class="form-section-title"><i class="fa-solid fa-briefcase"></i> Work Experience</h3>
                <div id="experienceContainer"></div>
                <button class="add-item-btn" id="addExperienceBtn">
                    <i class="fa-solid fa-plus"></i> Add Experience
                </button>
            </div>

            <!-- Education -->
            <div class="form-section">
                <h3 class="form-section-title"><i class="fa-solid fa-graduation-cap"></i> Education</h3>
                <div id="educationContainer"></div>
                <button class="add-item-btn" id="addEducationBtn">
                    <i class="fa-solid fa-plus"></i> Add Education
                </button>
            </div>

            <!-- Skills -->
            <div class="form-section">
                <h3 class="form-section-title"><i class="fa-solid fa-star"></i> Skills</h3>
                <textarea class="form-textarea" id="skills" placeholder="Enter your skills, separated by commas (e.g., JavaScript, Python, Project Management)" rows="4"></textarea>
                <small class="form-hint">Separate skills with commas</small>
            </div>

            <!-- Certifications (Optional) -->
            <div class="form-section">
                <h3 class="form-section-title"><i class="fa-solid fa-certificate"></i> Certifications (Optional)</h3>
                <div id="certificationsContainer"></div>
                <button class="add-item-btn" id="addCertificationBtn">
                    <i class="fa-solid fa-plus"></i> Add Certification
                </button>
            </div>

            <!-- Languages (Optional) -->
            <div class="form-section">
                <h3 class="form-section-title"><i class="fa-solid fa-language"></i> Languages (Optional)</h3>
                <textarea class="form-textarea" id="languages" placeholder="Enter languages and proficiency (e.g., English - Native, Spanish - Fluent)" rows="3"></textarea>
            </div>
        </aside>

        <!-- Center: Resume Preview -->
        <main class="resume-preview">
            <div class="template-header">
                <span class="template-label">Template: <span id="currentTemplateNameDisplay">Classic</span></span>
            </div>

            <div class="resume-paper">
                <iframe id="resumePreview"></iframe>
            </div>
        </main>

        <!-- Right Sidebar: AI Analysis -->
        <aside class="editor-sidebar right-sidebar">
            <h2 class="sidebar-section-title"><i class="fa-solid fa-robot"></i> AI Analysis</h2>

            <div class="ats-score-display">
                <div class="score-circle">
                    <svg viewBox="0 0 100 100" class="score-svg">
                        <circle cx="50" cy="50" r="45" class="score-bg"></circle>
                        <circle cx="50" cy="50" r="45" class="score-fill" style="stroke-dashoffset: 282"></circle>
                    </svg>
                    <div class="score-text">--</div>
                </div>
                <p class="score-label">ATS Score</p>
                <p class="score-status">Not analyzed yet</p>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Job Description</h3>

                <!-- Input Type Toggle -->
                <div class="input-toggle">
                    <button class="toggle-btn active" id="textToggle" type="button">
                        <i class="fa-solid fa-keyboard"></i> Text Input
                    </button>
                    <button class="toggle-btn" id="fileToggle" type="button">
                        <i class="fa-solid fa-file-pdf"></i> Upload PDF
                    </button>
                </div>

                <!-- Text Input Option -->
                <div class="input-option" id="textInput">
                    <textarea class="form-textarea" id="jobDescText" placeholder="Paste job description here..." rows="6"></textarea>
                </div>

                <!-- File Upload Option -->
                <div class="input-option hidden" id="fileInput">
                    <div class="file-upload-area">
                        <input type="file" id="jobDescFile" accept=".pdf" hidden>
                        <label for="jobDescFile" class="file-upload-label">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <span class="upload-text">Click to upload or drag and drop</span>
                            <span class="upload-subtext">PDF files only (Max 10MB)</span>
                        </label>
                        <div class="file-info hidden" id="fileInfo">
                            <i class="fa-solid fa-file-pdf"></i>
                            <span class="file-name" id="fileName"></span>
                            <button class="remove-file-btn" id="removeFile" type="button">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <button class="analyze-btn" id="analyzeBtn">Analyze Match</button>
            </div>

            <div class="suggestions-section">
                <h3 class="form-section-title">Suggestions</h3>
                <div id="suggestionsContent">
                    <p class="empty-state">Analyze your resume against a job description to get suggestions.</p>
                </div>
            </div>
        </aside>
    </div>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 ResumeSync. All rights reserved.</p>
        </div>
    </footer>

    <!-- Analysis Modal -->
    <div class="analysis-modal" id="analysisModal">
        <div class="analysis-modal-content">
            <button class="close-modal-btn" onclick="hideAnalysisModal()">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="analysis-modal-header">
                <h2><i class="fa-solid fa-chart-line"></i> ATS Analysis</h2>
                <p>Analyzing your resume against the job description</p>
            </div>

            <!-- Progress Section -->
            <div class="progress-container">
                <div class="progress-bar-wrapper">
                    <div class="progress-bar animated"></div>
                </div>
                <p class="progress-status">Initializing analysis...</p>
            </div>

            <!-- Analysis Steps -->
            <div class="analysis-steps">
                <div class="analysis-step">
                    <div class="step-icon"><i class="fa-solid fa-file-lines"></i></div>
                    <span>Preparing resume data</span>
                </div>
                <div class="analysis-step">
                    <div class="step-icon"><i class="fa-solid fa-briefcase"></i></div>
                    <span>Processing job description</span>
                </div>
                <div class="analysis-step">
                    <div class="step-icon"><i class="fa-solid fa-brain"></i></div>
                    <span>Analyzing with AI</span>
                </div>
                <div class="analysis-step">
                    <div class="step-icon"><i class="fa-solid fa-lightbulb"></i></div>
                    <span>Generating recommendations</span>
                </div>
            </div>

            <!-- Results Section -->
            <div class="analysis-results">
                <div class="result-score-display">
                    <div class="result-score-circle">
                        <svg viewBox="0 0 160 160" class="result-score-svg">
                            <circle cx="80" cy="80" r="70" class="result-score-bg"></circle>
                            <circle cx="80" cy="80" r="70" class="result-score-fill" style="stroke-dashoffset: 440"></circle>
                        </svg>
                        <div class="result-score-text">--</div>
                    </div>
                    <p class="result-score-label">ATS Score</p>
                    <p class="result-score-status">Analyzing...</p>
                </div>

                <div class="modal-results-content">
                    <!-- Results will be populated here -->
                </div>

                <div class="modal-actions">
                    <button class="modal-btn modal-btn-secondary" onclick="hideAnalysisModal()">Close</button>
                    <button class="modal-btn modal-btn-primary" onclick="hideAnalysisModal()">View Full Details</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Pass resume data to JavaScript
        const resumeData = <?php echo json_encode([
            'id' => $resumeId,
            'resume_title' => $resumeData['resume_title'] ?? '',
            'template_name' => $templateName,
            'personal_details' => $personalDetails,
            'summary_text' => $resumeData['summary_text'] ?? '',
            'status' => $resumeData['status'] ?? 'draft'
        ]); ?>;
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="js/app.js?v=5"></script>
    <script src="js/editor-classic.js?v=4"></script>
</body>
</html>
