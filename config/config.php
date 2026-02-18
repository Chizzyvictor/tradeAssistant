<?php
/**
 * Application Configuration
 */

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Define base paths
define('BASE_PATH', dirname(__DIR__));
define('BASE_URL', '/');

// Include database configuration
require_once BASE_PATH . '/config/database.php';

// Timezone
date_default_timezone_set('UTC');

// Error reporting - IMPORTANT: Disable in production for security
// In production, set: error_reporting(0) and ini_set('display_errors', 0)
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Redirect to login page if not authenticated
 */
function requireAuth() {
    if (!isLoggedIn()) {
        header('Location: ' . BASE_URL . 'login.php');
        exit;
    }
}

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Format currency
 */
function formatCurrency($amount) {
    return '$' . number_format($amount, 2);
}

/**
 * Format date
 */
function formatDate($date) {
    return date('M d, Y H:i', strtotime($date));
}
