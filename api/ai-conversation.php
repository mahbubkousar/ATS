<?php
/**
 * AI Conversation API Endpoint
 * Handles conversational resume building using Gemini API
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('log_errors', '1');

header('Content-Type: application/json');

// Set error handler to catch fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        error_log("AI Conversation Fatal Error: " . json_encode($error));
        echo json_encode(['success' => false, 'error' => 'Fatal error: ' . $error['message'], 'file' => $error['file'], 'line' => $error['line']]);
    }
});

try {
    require_once '../config/session.php';
    require_once '../config/database.php';
    require_once '../config/gemini.php';
} catch (Throwable $e) {
    error_log("AI Conversation - Include Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Configuration error: ' . $e->getMessage()]);
    exit;
}

// Check if user is logged in
if (!isLoggedIn()) {
    echo json_encode([
        'success' => false,
        'error' => 'User not authenticated'
    ]);
    exit;
}

$user = getCurrentUser();

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$userMessage = $input['message'] ?? '';
$resumeState = $input['resumeState'] ?? [];
$conversationHistory = $input['conversationHistory'] ?? [];

if (empty($userMessage)) {
    echo json_encode([
        'success' => false,
        'error' => 'Message is required'
    ]);
    exit;
}

// Get template configuration
$templateName = $resumeState['template'] ?? 'classic';
$conversationStage = $resumeState['conversation_stage'] ?? 'welcome';

// Load template config from JavaScript equivalent
$templateConfigs = [
    'classic' => [
        'name' => 'Classic',
        'type' => 'professional',
        'fields' => ['personal_details', 'summary', 'experience', 'education', 'skills']
    ],
    'modern' => [
        'name' => 'Modern',
        'type' => 'professional',
        'fields' => ['personal_details', 'summary', 'experience', 'education', 'skills']
    ],
    'professional' => [
        'name' => 'Professional',
        'type' => 'professional',
        'fields' => ['personal_details', 'summary', 'experience', 'education', 'skills']
    ],
    'technical' => [
        'name' => 'Technical',
        'type' => 'professional',
        'fields' => ['personal_details', 'summary', 'experience', 'education', 'skills', 'projects']
    ],
    'executive' => [
        'name' => 'Executive',
        'type' => 'professional',
        'fields' => ['personal_details', 'summary', 'achievements', 'experience', 'education', 'skills', 'board']
    ],
    'creative' => [
        'name' => 'Creative Professional',
        'type' => 'professional',
        'fields' => ['personal_details', 'summary', 'experience', 'education', 'skills', 'portfolio']
    ],
    'academic-standard' => [
        'name' => 'Academic Standard CV',
        'type' => 'academic',
        'fields' => ['personal_details', 'research_interests', 'education', 'experience', 'publications', 'grants', 'teaching', 'references']
    ],
    'research-scientist' => [
        'name' => 'Research Scientist CV',
        'type' => 'academic',
        'fields' => ['personal_details', 'research_interests', 'education', 'experience', 'publications', 'grants', 'references']
    ],
    'teaching-faculty' => [
        'name' => 'Teaching-Focused Faculty CV',
        'type' => 'academic',
        'fields' => ['personal_details', 'research_interests', 'education', 'teaching', 'publications', 'references']
    ]
];

$templateConfig = $templateConfigs[$templateName] ?? $templateConfigs['classic'];

// Build conversation context for Gemini
$systemPrompt = buildSystemPrompt($templateConfig, $conversationStage, $resumeState);

// Call Gemini API
try {
    error_log("AI Conversation - Current stage: {$conversationStage}, Template: {$templateName}");

    $geminiResponse = callGeminiAPIWithConversation($systemPrompt, $userMessage, $conversationHistory);

    error_log("AI Conversation - Gemini response length: " . strlen($geminiResponse));

    // Parse Gemini response to extract structured data
    $parsedData = parseGeminiResponse($geminiResponse, $conversationStage, $resumeState);

    error_log("AI Conversation - Extracted data: " . json_encode($parsedData));

    // Determine next conversation stage
    $nextStage = determineNextStage($conversationStage, $templateConfig['type'], $parsedData);

    error_log("AI Conversation - Next stage: {$nextStage}");

    echo json_encode([
        'success' => true,
        'ai_message' => $geminiResponse,
        'extracted_data' => $parsedData,
        'next_stage' => $nextStage,
        'update_preview' => !empty($parsedData),
        'current_stage' => $conversationStage  // Add for debugging
    ]);

} catch (Exception $e) {
    error_log("AI Conversation Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Failed to process conversation',
        'details' => $e->getMessage()
    ]);
}

/**
 * Build system prompt for Gemini based on conversation stage
 */
function buildSystemPrompt($templateConfig, $stage, $resumeState) {
    $templateName = $templateConfig['name'];

    $basePrompt = "You are an expert resume builder assistant helping a user create a {$templateName} resume. ";
    $basePrompt .= "Your role is to guide them through a conversational process, extracting information naturally. ";
    $basePrompt .= "Be friendly, professional, and encouraging.\n\n";

    // Stage-specific instructions
    switch ($stage) {
        case 'welcome':
            $basePrompt .= "CURRENT TASK: Welcome the user and start collecting personal information.\n";
            $basePrompt .= "Be friendly and immediately ask for their basic info in one question.\n";
            $basePrompt .= "Ask: name, professional title, email, phone, and location in a natural way.\n\n";
            $basePrompt .= "Do NOT include JSON yet - just welcome them and ask for info.";
            break;

        case 'personal_details':
            $basePrompt .= "CURRENT TASK: Collect personal information (full name, professional title, email, phone, location, LinkedIn).\n";
            $basePrompt .= "Extract ALL details from the user's message. If they provide partial info, extract what they gave.\n";
            $basePrompt .= "Respond briefly and naturally, then ask ONLY for missing critical fields (name, email, phone).\n";
            $basePrompt .= "LinkedIn and professional title are optional - don't ask if not provided.\n\n";
            $basePrompt .= "CRITICAL: ALWAYS include a JSON block at the end with the data extracted, even if partial.\n";
            $basePrompt .= "Do NOT include fields with placeholder values like '...' or 'N/A'.\n";
            $basePrompt .= "ONLY include fields that the user actually provided.\n";
            $basePrompt .= "Example format:\n";
            $basePrompt .= "```json\n{\"fullName\": \"John Doe\", \"professionalTitle\": \"Software Engineer\", \"email\": \"john@example.com\", \"phone\": \"+1-555-0100\", \"location\": \"New York, NY\"}\n```\n";
            $basePrompt .= "If user only provided name and email, output: {\"fullName\": \"...\", \"email\": \"...\"}";
            break;

        case 'summary':
            $basePrompt .= "CURRENT TASK: Create a professional summary for the user's resume.\n";
            $basePrompt .= "When they describe their background/experience, IMMEDIATELY write a 2-3 sentence professional summary.\n";
            $basePrompt .= "DO NOT just ask questions - WRITE the summary for them based on what they tell you.\n";
            $basePrompt .= "Format: Achievement-focused, quantifiable, and compelling.\n\n";
            $basePrompt .= "MANDATORY: You MUST include a JSON block with the summary at the end of your response.\n";
            $basePrompt .= "Even if they only give you minimal info, create a summary and include it in JSON.\n";
            $basePrompt .= "Response structure: [Acknowledge their info] + [Present the summary you wrote] + [JSON block]\n\n";
            $basePrompt .= "Example response:\n";
            $basePrompt .= "Great! Based on what you've told me, here's a professional summary:\n\n";
            $basePrompt .= "\"Results-driven software engineer with 5+ years of experience...\"\n\n";
            $basePrompt .= "```json\n{\"summary\": \"Results-driven software engineer with 5+ years of experience in full-stack development...\"}\n```";
            break;

        case 'experience':
            $basePrompt .= "CURRENT TASK: Collect work experience details.\n";
            $basePrompt .= "When user describes their job, immediately extract and format it professionally.\n";
            $basePrompt .= "Create strong bullet points from what they describe - be proactive!\n";
            $basePrompt .= "After adding one experience, ask if they have more (keep it brief).\n\n";
            $basePrompt .= "CRITICAL: ALWAYS include extracted experience in JSON format.\n";
            $basePrompt .= "Format dates as 'YYYY-MM' or 'Present'. Create bullet point description from their narrative.\n";
            $basePrompt .= "Example format:\n";
            $basePrompt .= "```json\n{\"experience\": [{\"title\": \"Software Engineer\", \"company\": \"Tech Corp\", \"start_date\": \"2020-01\", \"end_date\": \"Present\", \"location\": \"New York, NY\", \"description\": \"• Led development of microservices\\n• Improved performance by 40%\"}]}\n```";
            break;

        case 'education':
            $basePrompt .= "CURRENT TASK: Collect education details.\n";
            $basePrompt .= "Extract: degree, field of study, institution, graduation date, GPA (if mentioned).\n";
            $basePrompt .= "After extracting one, briefly ask if they have more degrees.\n\n";
            $basePrompt .= "CRITICAL: ALWAYS include extracted education in JSON format.\n";
            $basePrompt .= "Example format:\n";
            $basePrompt .= "```json\n{\"education\": [{\"degree\": \"Bachelor of Science\", \"field\": \"Computer Science\", \"institution\": \"MIT\", \"graduation_date\": \"2020\"}]}\n```";
            break;

        case 'skills':
            $basePrompt .= "CURRENT TASK: Collect skills relevant to their target role.\n";
            $basePrompt .= "When they list skills, immediately extract and format them professionally.\n";
            $basePrompt .= "If they describe what they know, convert it into a clean skills list.\n\n";
            $basePrompt .= "CRITICAL: ALWAYS include extracted skills as comma-separated string in JSON.\n";
            $basePrompt .= "Example format:\n";
            $basePrompt .= "```json\n{\"skills\": \"JavaScript, React, Node.js, Python, AWS, Docker\"}\n```";
            break;

        case 'projects':
            $basePrompt .= "CURRENT TASK: Collect project details (for Technical resume).\n";
            $basePrompt .= "Extract: project name, description, technologies used, link (if applicable).\n\n";
            $basePrompt .= "IMPORTANT: Only include projects with ACTUAL data that the user provided.\n";
            $basePrompt .= "Example format:\n";
            $basePrompt .= "```json\n{\"projects\": [{\"name\": \"E-commerce Platform\", \"description\": \"Built scalable shopping platform\", \"technologies\": \"React, Node.js, MongoDB\", \"link\": \"https://github.com/user/project\"}]}\n```";
            break;

        case 'research_interests':
            $basePrompt .= "CURRENT TASK: Collect research interests (for Academic CV).\n";
            $basePrompt .= "Help them articulate their research focus clearly.\n\n";
            $basePrompt .= "IMPORTANT: Only include research interests if the user actually provides them.\n";
            $basePrompt .= "If they haven't provided them yet, do NOT include the JSON block.\n";
            $basePrompt .= "Example format (only when user provides data):\n";
            $basePrompt .= "```json\n{\"research_interests\": \"Machine Learning for Healthcare, Natural Language Processing, Computer Vision\"}\n```";
            break;

        case 'publications':
            $basePrompt .= "CURRENT TASK: Collect publication details (for Academic CV).\n";
            $basePrompt .= "Extract: authors, title, journal/conference, year, DOI/link.\n\n";
            $basePrompt .= "IMPORTANT: Only include publications with ACTUAL data.\n";
            $basePrompt .= "Example format:\n";
            $basePrompt .= "```json\n{\"publications\": [{\"authors\": \"Smith, J., Doe, J.\", \"title\": \"Deep Learning Applications\", \"venue\": \"ICML 2023\", \"year\": \"2023\", \"link\": \"https://doi.org/...\"}]}\n```";
            break;

        case 'references':
            $basePrompt .= "CURRENT TASK: Collect references (for Academic CV).\n";
            $basePrompt .= "Extract: name, title, institution, email, phone.\n\n";
            $basePrompt .= "IMPORTANT: Only include references with ACTUAL data.\n";
            $basePrompt .= "Example format:\n";
            $basePrompt .= "```json\n{\"references\": [{\"name\": \"Dr. Jane Smith\", \"title\": \"Professor\", \"institution\": \"MIT\", \"email\": \"jsmith@mit.edu\", \"phone\": \"+1-555-0100\"}]}\n```";
            break;

        default:
            $basePrompt .= "Engage naturally with the user and help them with their resume.";
    }

    // Add context about what we already have
    $basePrompt .= "\n\n=== CURRENT RESUME STATE ===\n";
    $basePrompt .= "Current stage: {$stage}\n";

    if (!empty($resumeState['personal_details'])) {
        $basePrompt .= "Personal details collected: " . json_encode($resumeState['personal_details']) . "\n";
    }
    if (!empty($resumeState['summary_text'])) {
        $basePrompt .= "Summary: " . $resumeState['summary_text'] . "\n";
    }
    if (!empty($resumeState['experience'])) {
        $basePrompt .= "Experience entries: " . count($resumeState['experience']) . "\n";
    }
    if (!empty($resumeState['education'])) {
        $basePrompt .= "Education entries: " . count($resumeState['education']) . "\n";
    }
    if (!empty($resumeState['skills'])) {
        $skillsStr = is_array($resumeState['skills']) ? implode(', ', $resumeState['skills']) : $resumeState['skills'];
        $basePrompt .= "Skills: " . $skillsStr . "\n";
    }

    $basePrompt .= "\nREMEMBER: For this stage ({$stage}), you MUST include JSON data in your response if extracting information!\n";

    return $basePrompt;
}

/**
 * Call Gemini API with conversation context (wrapper around standard callGeminiAPI)
 */
function callGeminiAPIWithConversation($systemPrompt, $userMessage, $conversationHistory) {
    // Build full prompt with conversation history
    $fullPrompt = $systemPrompt . "\n\n";

    // Add conversation history
    if (!empty($conversationHistory)) {
        $fullPrompt .= "Previous conversation:\n";
        foreach ($conversationHistory as $msg) {
            $role = $msg['sender'] === 'user' ? 'User' : 'Assistant';
            $fullPrompt .= "{$role}: {$msg['text']}\n";
        }
        $fullPrompt .= "\n";
    }

    // Add current message
    $fullPrompt .= "Current User Message: {$userMessage}\n\n";
    $fullPrompt .= "IMPORTANT INSTRUCTIONS:\n";
    $fullPrompt .= "1. Respond naturally and conversationally\n";
    $fullPrompt .= "2. Extract or create the requested content (summary, experience, etc.)\n";
    $fullPrompt .= "3. ALWAYS end your response with a JSON code block containing the data\n";
    $fullPrompt .= "4. Format: ```json\\n{...}\\n```\n";

    // Use the standard callGeminiAPI from gemini.php
    $result = callGeminiAPI($fullPrompt);

    if (!$result['success']) {
        throw new Exception($result['error']);
    }

    return $result['text'];
}

/**
 * Parse Gemini response to extract structured data
 */
function parseGeminiResponse($geminiResponse, $stage, $resumeState) {
    // Look for JSON block in response
    if (preg_match('/```json\s*(\{.*?\})\s*```/s', $geminiResponse, $matches)) {
        $jsonData = json_decode($matches[1], true);
        if ($jsonData) {
            // Filter out placeholder values
            $cleanData = filterPlaceholders($jsonData);
            return $cleanData;
        }
    }

    // Fallback: Try to extract data based on stage when JSON is missing
    error_log("AI Conversation - No JSON found in response for stage: {$stage}. Attempting fallback extraction.");

    // For summary stage, try to extract quoted text as summary
    if ($stage === 'summary') {
        // Look for text in quotes that looks like a summary
        if (preg_match('/"([^"]{50,})"/', $geminiResponse, $matches)) {
            error_log("AI Conversation - Extracted summary from quotes: {$matches[1]}");
            return ['summary' => $matches[1]];
        }
        // Look for text after "summary:" or "professional summary:"
        if (preg_match('/(?:professional )?summary[:\s]+([^\n]{50,})/i', $geminiResponse, $matches)) {
            error_log("AI Conversation - Extracted summary from text: {$matches[1]}");
            return ['summary' => trim($matches[1])];
        }
    }

    return [];
}

/**
 * Filter out placeholder values from extracted data
 */
function filterPlaceholders($data) {
    $placeholders = ['...', 'N/A', '', null];
    $cleanData = [];

    foreach ($data as $key => $value) {
        // Skip placeholder values
        if (in_array($value, $placeholders, true)) {
            continue;
        }

        // For arrays, filter each item
        if (is_array($value)) {
            $cleanArray = [];
            foreach ($value as $item) {
                if (is_array($item)) {
                    // Filter nested arrays (like experience, education entries)
                    $cleanItem = filterPlaceholders($item);
                    if (!empty($cleanItem)) {
                        $cleanArray[] = $cleanItem;
                    }
                } else if (!in_array($item, $placeholders, true)) {
                    $cleanArray[] = $item;
                }
            }
            if (!empty($cleanArray)) {
                $cleanData[$key] = $cleanArray;
            }
        } else {
            $cleanData[$key] = $value;
        }
    }

    return $cleanData;
}

/**
 * Determine next conversation stage
 */
function determineNextStage($currentStage, $templateType, $parsedData) {
    $flows = [
        'professional' => ['welcome', 'personal_details', 'summary', 'experience', 'education', 'skills', 'template_specific', 'completion'],
        'academic' => ['welcome', 'personal_details', 'research_interests', 'education', 'experience', 'publications', 'grants', 'teaching', 'references', 'completion']
    ];

    $flow = $flows[$templateType] ?? $flows['professional'];
    $currentIndex = array_search($currentStage, $flow);

    if ($currentIndex === false || $currentIndex === count($flow) - 1) {
        return 'completion';
    }

    // If data was extracted, move to next stage
    if (!empty($parsedData)) {
        return $flow[$currentIndex + 1];
    }

    // Otherwise stay on current stage
    return $currentStage;
}
