<?php
/**
 * AI Conversation API Endpoint - V2
 * Handles conversational resume building using Gemini API
 * Redesigned for multi-template support
 */

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Don't display errors in JSON response

try {
    require_once '../config/session.php';
    require_once '../config/database.php';
    require_once '../config/gemini.php';
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => 'Configuration error: ' . $e->getMessage()]);
    exit;
}

// Check if user is logged in
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'error' => 'User not authenticated']);
    exit;
}

$user = getCurrentUser();

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$userMessage = $input['message'] ?? '';
$resumeState = $input['resumeState'] ?? [];
$conversationHistory = $input['conversationHistory'] ?? [];
$templateName = $input['templateName'] ?? 'modern';

if (empty($userMessage)) {
    echo json_encode(['success' => false, 'error' => 'Message is required']);
    exit;
}

// Build system instruction based on template
$systemInstruction = buildSystemInstruction($templateName, $resumeState);

// Build conversation context
$conversationContext = buildConversationPrompt($userMessage, $conversationHistory, $resumeState);

// Call Gemini API
try {
    $geminiResponse = callGeminiAPI($conversationContext, $systemInstruction);

    if (!$geminiResponse['success']) {
        throw new Exception($geminiResponse['error'] ?? 'API call failed');
    }

    $aiMessage = $geminiResponse['text'];

    // Extract structured data from AI response
    $extractedData = extractStructuredData($aiMessage, $templateName);

    // Extract conversational response (remove DATA_UPDATES section for display)
    $conversationalResponse = $aiMessage;

    // Check if response has the structured format
    if (preg_match('/CONVERSATIONAL_RESPONSE:\s*(.+?)(?=\s*DATA_UPDATES:|$)/s', $aiMessage, $matches)) {
        // Extract just the conversational part
        $conversationalResponse = trim($matches[1]);
    } else {
        // If no "CONVERSATIONAL_RESPONSE:" marker, just remove DATA_UPDATES section
        $conversationalResponse = preg_replace('/\s*DATA_UPDATES:\s*```json.*?```/s', '', $aiMessage);
        $conversationalResponse = trim($conversationalResponse);
    }

    echo json_encode([
        'success' => true,
        'response' => $conversationalResponse,
        'updates' => $extractedData
    ]);

} catch (Exception $e) {
    error_log("AI Conversation Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Failed to process conversation: ' . $e->getMessage()
    ]);
}

/**
 * Build system instruction based on template type
 */
function buildSystemInstruction($templateName, $resumeState) {
    $baseInstruction = "You are an expert resume writing assistant helping users build ATS-optimized resumes through conversation. ";
    $baseInstruction .= "Your role is to:\n";
    $baseInstruction .= "1. Ask relevant questions to gather resume information\n";
    $baseInstruction .= "2. Extract and structure the information provided\n";
    $baseInstruction .= "3. Provide helpful suggestions for improvement\n";
    $baseInstruction .= "4. Use professional, friendly language\n\n";

    // Template-specific instructions
    if ($templateName === 'academic-standard') {
        $baseInstruction .= "This is an ACADEMIC CV template. Focus on:\n";
        $baseInstruction .= "- Research interests and expertise\n";
        $baseInstruction .= "- Publications (journal articles, conference papers)\n";
        $baseInstruction .= "- Grants and funding\n";
        $baseInstruction .= "- Teaching experience and courses taught\n";
        $baseInstruction .= "- Professional memberships and service\n";
        $baseInstruction .= "- Education with dissertation/thesis details\n\n";
    } else {
        $baseInstruction .= "This is a PROFESSIONAL resume template. Focus on:\n";
        $baseInstruction .= "- Professional summary highlighting career achievements\n";
        $baseInstruction .= "- Work experience with quantifiable accomplishments\n";
        $baseInstruction .= "- Technical and soft skills\n";
        $baseInstruction .= "- Education and certifications\n";
        $baseInstruction .= "- Use action verbs and metrics\n\n";
    }

    $baseInstruction .= "IMPORTANT: When the user provides information, you MUST respond in this EXACT format:\n\n";
    $baseInstruction .= "CONVERSATIONAL_RESPONSE: [Your friendly response here]\n\n";
    $baseInstruction .= "DATA_UPDATES:\n```json\n{\n  \"field_name\": \"value\"\n}\n```\n\n";
    $baseInstruction .= "For personal_details updates, use format:\n";
    $baseInstruction .= '{"personal_details": {"fullName": "John Doe", "professionalTitle": "Software Engineer"}}' . "\n\n";
    $baseInstruction .= "For experience, use array format:\n";
    $baseInstruction .= '{"experience": [{"jobTitle": "...", "company": "...", "dates": "...", "description": "..."}]}' . "\n\n";
    $baseInstruction .= "For education, use array format:\n";
    $baseInstruction .= '{"education": [{"degree": "...", "institution": "...", "year": "...", "details": "..."}]}' . "\n\n";
    $baseInstruction .= "For skills (professional templates), use string:\n";
    $baseInstruction .= '{"skills": "Python, JavaScript, React, Node.js"}' . "\n\n";
    $baseInstruction .= "Always include both CONVERSATIONAL_RESPONSE and DATA_UPDATES sections.\n\n";

    $baseInstruction .= "Current resume data:\n" . json_encode($resumeState, JSON_PRETTY_PRINT);

    return $baseInstruction;
}

/**
 * Build conversation prompt
 */
function buildConversationPrompt($userMessage, $conversationHistory, $resumeState) {
    $prompt = "User's latest message: " . $userMessage . "\n\n";

    // Add context from conversation history (last 5 messages)
    if (!empty($conversationHistory)) {
        $prompt .= "Recent conversation:\n";
        $recentHistory = array_slice($conversationHistory, -5);
        foreach ($recentHistory as $msg) {
            $role = $msg['role'] === 'user' ? 'User' : 'Assistant';
            $prompt .= "{$role}: {$msg['content']}\n";
        }
        $prompt .= "\n";
    }

    $prompt .= "Respond conversationally to help build their resume. ";
    $prompt .= "If the user provides information (name, experience, education, skills, etc.), acknowledge it and ask a relevant follow-up question.\n";
    $prompt .= "Keep responses concise and friendly.";

    return $prompt;
}

/**
 * Extract structured data from AI response
 */
function extractStructuredData($aiMessage, $templateName) {
    $updates = [];

    // Look for DATA_UPDATES section with JSON
    if (preg_match('/DATA_UPDATES:\s*```json\s*(\{.*?\})\s*```/s', $aiMessage, $matches)) {
        $jsonData = $matches[1];
        $parsedData = json_decode($jsonData, true);

        if ($parsedData && is_array($parsedData)) {
            $updates = $parsedData;
        }
    }

    return $updates;
}
?>
