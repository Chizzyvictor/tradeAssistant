#!/usr/bin/env node
/**
 * Demo Script - Quick Start for Inventory Management System
 * 
 * This script helps you quickly set up and run the inventory system
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const readline = require('readline');

console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║            INVENTORY MANAGEMENT SYSTEM - DEMO & QUICK START                 ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
console.log('\n');

// Check PHP version
let phpVersion = 'Not installed';
let phpOK = false;
try {
    phpVersion = execSync('php -v', { encoding: 'utf8' }).split('\n')[0];
    const versionMatch = phpVersion.match(/PHP (\d+\.\d+)/);
    if (versionMatch) {
        const version = parseFloat(versionMatch[1]);
        phpOK = version >= 7.4;
        phpVersion = versionMatch[1];
    }
} catch (e) {
    // PHP not installed
}

console.log('📋 SYSTEM CHECK');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`PHP Version: ${phpVersion} ${phpOK ? '✅' : '❌ Need 7.4+'}`);

// Check if database config exists
const configExists = fs.existsSync('config/database.php');
console.log(`Config File: ${configExists ? '✅ Found' : '❌ Missing'}`);

console.log('\n');

if (!phpOK) {
    console.log('❌ PHP 7.4+ is required but not found.');
    console.log('Please install PHP 7.4 or higher to run this application.\n');
    process.exit(1);
}

console.log('🚀 QUICK START GUIDE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n');
console.log('STEP 1: Database Setup');
console.log('  → Create a MySQL database named \'inventory_system\'');
console.log('  → Import the database.sql file:');
console.log('     mysql -u root -p inventory_system < database.sql');
console.log('\n');
console.log('STEP 2: Configure Database Connection');
console.log('  → Edit config/database.php with your MySQL credentials');
console.log('  → Update DB_HOST, DB_USER, DB_PASS, DB_NAME');
console.log('\n');
console.log('STEP 3: Start the Development Server');
console.log('  → Run: php -S localhost:8000');
console.log('  → Or use: npm run demo');
console.log('\n');
console.log('STEP 4: Access the Application');
console.log('  → Open: http://localhost:8000/login.php');
console.log('  → Login: admin / admin123');
console.log('\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n');
console.log('🌟 Starting PHP Development Server...\n');
console.log('Server running at: http://localhost:8000');
console.log('Access login page: http://localhost:8000/login.php');
console.log('Default credentials: admin / admin123');
console.log('\nPress Ctrl+C to stop the server\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n');

// Start PHP server
const phpServer = spawn('php', ['-S', 'localhost:8000'], {
    stdio: 'inherit'
});

phpServer.on('error', (err) => {
    console.error('\n❌ Failed to start PHP server:', err.message);
    console.log('\nPlease ensure PHP is installed and accessible from your PATH.\n');
    process.exit(1);
});

phpServer.on('close', (code) => {
    console.log(`\n\n👋 Server stopped (exit code: ${code})\n`);
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  For help, see: README.md, INSTALL.md, or visit the GitHub repository       ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
    console.log('\n');
});
