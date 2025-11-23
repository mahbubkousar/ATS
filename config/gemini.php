<?php
/**
 * Gemini AI API Configuration
 *
 * IMPORTANT: Add your Gemini API key below
 * Get your API key from: https://makersuite.google.com/app/apikey
 */

// Your Gemini API Key
define('GEMINI_API_KEY', 'AIzaSyC4qoNIme-Gx9MZSm9ypc54E9gTkXFzu-k');

// Gemini API Endpoint (using gemini-2.0-flash-exp for better performance)
define('GEMINI_MODEL_NAME', 'gemini-2.0-flash-exp');
define('GEMINI_API_ENDPOINT', 'https://generativelanguage.googleapis.com/v1beta/models/' . GEMINI_MODEL_NAME . ':generateContent');

/**
 * Make Gemini API Request
 */
function callGeminiAPI($prompt, $systemInstruction = '') {
    $apiKey = GEMINI_API_KEY;

    if ($apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        return [
            'success' => false,
            'error' => 'Gemini API key not configured. Please update config/gemini.php'
        ];
    }

    $url = GEMINI_API_ENDPOINT . '?key=' . $apiKey;

    $data = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.4,
            'topK' => 32,
            'topP' => 1,
            'maxOutputTokens' => 4096,
        ]
    ];

    if ($systemInstruction) {
        $data['systemInstruction'] = [
            'parts' => [
                ['text' => $systemInstruction]
            ]
        ];
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return [
            'success' => false,
            'error' => 'API request failed with status: ' . $httpCode,
            'response' => $response
        ];
    }

    $result = json_decode($response, true);

    if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        return [
            'success' => true,
            'text' => $result['candidates'][0]['content']['parts'][0]['text']
        ];
    }

    return [
        'success' => false,
        'error' => 'Unexpected API response format',
        'response' => $response
    ];
}
?>
