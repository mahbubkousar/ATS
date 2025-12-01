<?php
/**
 * Google Gemini AI Configuration
 */

// Gemini API Configuration
define('GEMINI_API_KEY', 'AIzaSyC4qoNIme-Gx9MZSm9ypc54E9gTkXFzu-k'); // Main API key
define('GEMINI_MODEL', 'gemini-2.0-flash-exp'); // Latest flash model

// API Endpoint
define('GEMINI_API_ENDPOINT', 'https://generativelanguage.googleapis.com/v1beta/models/');

// Generation settings
define('GEMINI_TEMPERATURE', 0.7); // Balanced creativity
define('GEMINI_MAX_TOKENS', 1024); // Max response length
define('GEMINI_TOP_K', 40);
define('GEMINI_TOP_P', 0.95);
