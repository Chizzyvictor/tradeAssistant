<?php
/**
 * Database Configuration
 * 
 * Configure your database connection settings here
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'inventory_system');

class Database {
    private $host = DB_HOST;
    private $user = DB_USER;
    private $pass = DB_PASS;
    private $dbname = DB_NAME;
    private $conn;
    private $error;

    /**
     * Establish database connection
     */
    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                'mysql:host=' . $this->host . ';dbname=' . $this->dbname,
                $this->user,
                $this->pass,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                )
            );
        } catch(PDOException $e) {
            $this->error = $e->getMessage();
            // Log error for debugging (in production, use error_log instead of echo)
            error_log('Database Connection Error: ' . $this->error);
            // Display generic error to user
            die('Database connection failed. Please check your configuration.');
        }

        return $this->conn;
    }

    /**
     * Get connection error if any
     */
    public function getError() {
        return $this->error;
    }
}
