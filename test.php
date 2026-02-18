<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Test - Inventory Management</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .test-box {
            background: white;
            padding: 20px;
            margin: 10px 0;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success {
            color: green;
            font-weight: bold;
        }
        .error {
            color: red;
            font-weight: bold;
        }
        .warning {
            color: orange;
            font-weight: bold;
        }
        h1 {
            color: #333;
        }
        .test-item {
            padding: 10px;
            margin: 5px 0;
            border-left: 4px solid #ddd;
            padding-left: 15px;
        }
        .test-item.pass {
            border-left-color: green;
            background-color: #f0fff0;
        }
        .test-item.fail {
            border-left-color: red;
            background-color: #fff0f0;
        }
    </style>
</head>
<body>
    <h1>🔧 System Installation Test</h1>
    
    <div class="test-box">
        <h2>PHP Configuration</h2>
        <?php
        // PHP Version Check
        $phpVersion = phpversion();
        $phpOK = version_compare($phpVersion, '7.4.0', '>=');
        echo '<div class="test-item ' . ($phpOK ? 'pass' : 'fail') . '">';
        echo '<strong>PHP Version:</strong> ' . $phpVersion . ' ';
        echo $phpOK ? '<span class="success">✓ OK</span>' : '<span class="error">✗ Need 7.4+</span>';
        echo '</div>';

        // PDO Extension
        $pdoOK = extension_loaded('pdo') && extension_loaded('pdo_mysql');
        echo '<div class="test-item ' . ($pdoOK ? 'pass' : 'fail') . '">';
        echo '<strong>PDO MySQL Extension:</strong> ';
        echo $pdoOK ? '<span class="success">✓ Installed</span>' : '<span class="error">✗ Not installed</span>';
        echo '</div>';

        // Session Support
        $sessionOK = function_exists('session_start');
        echo '<div class="test-item ' . ($sessionOK ? 'pass' : 'fail') . '">';
        echo '<strong>Session Support:</strong> ';
        echo $sessionOK ? '<span class="success">✓ Available</span>' : '<span class="error">✗ Not available</span>';
        echo '</div>';
        ?>
    </div>

    <div class="test-box">
        <h2>File System</h2>
        <?php
        // Check if config files exist
        $configExists = file_exists('config/config.php') && file_exists('config/database.php');
        echo '<div class="test-item ' . ($configExists ? 'pass' : 'fail') . '">';
        echo '<strong>Configuration Files:</strong> ';
        echo $configExists ? '<span class="success">✓ Found</span>' : '<span class="error">✗ Missing</span>';
        echo '</div>';

        // Check if main files exist
        $mainFiles = ['index.php', 'login.php', 'products.php', 'stock-movements.php'];
        $allExist = true;
        foreach ($mainFiles as $file) {
            if (!file_exists($file)) {
                $allExist = false;
                break;
            }
        }
        echo '<div class="test-item ' . ($allExist ? 'pass' : 'fail') . '">';
        echo '<strong>Main Application Files:</strong> ';
        echo $allExist ? '<span class="success">✓ Found</span>' : '<span class="error">✗ Missing</span>';
        echo '</div>';
        ?>
    </div>

    <div class="test-box">
        <h2>Database Connection</h2>
        <?php
        $dbConnected = false;
        $dbError = '';
        
        if (file_exists('config/database.php')) {
            require_once 'config/database.php';
            
            try {
                $db = new Database();
                $conn = $db->connect();
                if ($conn) {
                    $dbConnected = true;
                    
                    // Check if tables exist
                    $tables = ['users', 'products', 'categories', 'stock_movements'];
                    $tableCount = 0;
                    
                    foreach ($tables as $table) {
                        $result = $conn->query("SHOW TABLES LIKE '$table'");
                        if ($result->rowCount() > 0) {
                            $tableCount++;
                        }
                    }
                    
                    echo '<div class="test-item pass">';
                    echo '<strong>Database Connection:</strong> <span class="success">✓ Connected</span>';
                    echo '</div>';
                    
                    echo '<div class="test-item ' . ($tableCount == 4 ? 'pass' : 'fail') . '">';
                    echo '<strong>Database Tables:</strong> ' . $tableCount . '/4 ';
                    echo $tableCount == 4 ? '<span class="success">✓ All present</span>' : '<span class="error">✗ Missing tables</span>';
                    echo '</div>';
                }
            } catch (Exception $e) {
                $dbError = $e->getMessage();
                echo '<div class="test-item fail">';
                echo '<strong>Database Connection:</strong> <span class="error">✗ Failed</span>';
                echo '<br><small>' . htmlspecialchars($dbError) . '</small>';
                echo '</div>';
            }
        } else {
            echo '<div class="test-item fail">';
            echo '<strong>Database Configuration:</strong> <span class="error">✗ Config file not found</span>';
            echo '</div>';
        }
        ?>
    </div>

    <div class="test-box">
        <h2>Summary</h2>
        <?php
        $allTests = $phpOK && $pdoOK && $sessionOK && $configExists && $allExist && $dbConnected;
        
        if ($allTests) {
            echo '<p class="success">✓ All tests passed! Your system is ready to use.</p>';
            echo '<p><a href="login.php" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Go to Login Page</a></p>';
        } else {
            echo '<p class="error">✗ Some tests failed. Please check the issues above and refer to INSTALL.md for help.</p>';
        }
        ?>
    </div>

    <div class="test-box">
        <h3>Next Steps</h3>
        <ol>
            <li>If database connection failed, update credentials in <code>config/database.php</code></li>
            <li>If tables are missing, import <code>database.sql</code> into your MySQL database</li>
            <li>Once all tests pass, <a href="login.php">login with default credentials</a>:
                <ul>
                    <li>Username: <strong>admin</strong></li>
                    <li>Password: <strong>admin123</strong></li>
                </ul>
            </li>
            <li>Delete or rename this <code>test.php</code> file for security</li>
        </ol>
    </div>

    <div style="text-align: center; margin-top: 30px; color: #666;">
        <small>Inventory Management System v1.0</small>
    </div>
</body>
</html>
