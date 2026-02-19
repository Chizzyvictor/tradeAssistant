# Installation Guide

## Quick Start Guide

### Option A: Using npm (Easiest)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chizzyvictor/tradeAssistant.git
   cd tradeAssistant
   ```

2. **Install dependencies and run demo**
   ```bash
   npm install
   npm run demo
   ```
   
   This will:
   - Check your PHP installation
   - Display setup instructions
   - Start a PHP development server at http://localhost:8000

3. **Set up the database** (while server is running, open a new terminal)
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE inventory_system;"
   
   # Import schema
   mysql -u root -p inventory_system < database.sql
   ```

4. **Configure database credentials**
   - Edit `config/database.php` with your MySQL credentials

5. **Access the application**
   - Open: http://localhost:8000/login.php
   - Login: `admin` / `admin123`

### Option B: Using PHP Built-in Server

1. **Set up database** (same as Option A, step 3)

2. **Configure database connection** (same as Option A, step 4)

3. **Start PHP server**
   ```bash
   php -S localhost:8000
   ```

4. **Access the application** (same as Option A, step 5)

### Option C: Using Apache/Nginx (Traditional)

### Step 1: Database Setup

1. Open phpMyAdmin or MySQL command line
2. Create a new database:
   ```sql
   CREATE DATABASE inventory_system;
   ```
3. Import the database file:
   - Via phpMyAdmin: Import the `database.sql` file
   - Via command line:
     ```bash
     mysql -u root -p inventory_system < database.sql
     ```

### Step 2: Configure Database Connection

1. Open `config/database.php`
2. Update these lines with your database credentials:
   ```php
   define('DB_HOST', 'localhost');      // Usually 'localhost'
   define('DB_USER', 'root');            // Your MySQL username
   define('DB_PASS', '');                // Your MySQL password
   define('DB_NAME', 'inventory_system'); // Database name
   ```

### Step 3: Access the Application

1. Make sure your web server (Apache/Nginx) is running
2. Place the project folder in your web server's document root:
   - XAMPP: `C:\xampp\htdocs\tradeAssistant`
   - WAMP: `C:\wamp\www\tradeAssistant`
   - MAMP: `/Applications/MAMP/htdocs/tradeAssistant`
   - Linux: `/var/www/html/tradeAssistant`
   - Laragon: `C:\laragon\www\tradeAssistant`

3. Open your web browser and navigate to:
   ```
   http://localhost/tradeAssistant/login.php
   ```

4. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

### Step 4: Start Using

You're ready to go! You can now:
- Add products
- Create categories
- Record stock movements
- Monitor inventory levels

## Troubleshooting

### "Connection Error" Message
**Problem**: Cannot connect to database

**Solutions**:
1. Check that MySQL is running
2. Verify database credentials in `config/database.php`
3. Ensure the database `inventory_system` exists
4. Check MySQL user has proper privileges

### "Page Not Found" Error
**Problem**: Cannot access the application

**Solutions**:
1. Ensure web server is running
2. Check the file path is correct
3. Verify the project folder is in the correct directory

### Session Errors
**Problem**: Cannot login or session-related errors

**Solutions**:
1. Ensure PHP session directory is writable
2. Check PHP configuration for session settings
3. Clear browser cache and cookies

## Default Data

The system comes with:
- 1 admin user (username: admin, password: admin123)
- 4 sample categories
- 5 sample products

## Security Recommendations

1. **Change Default Password**: After first login, change the admin password
2. **Secure Database**: Use a strong password for your database user
3. **File Permissions**: Set appropriate file permissions (644 for files, 755 for directories)
4. **HTTPS**: Use HTTPS in production environments
5. **Backups**: Regularly backup your database

## System Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache 2.4+ or Nginx
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Need Help?

If you encounter any issues:
1. Check the main README.md for detailed documentation
2. Review the troubleshooting section
3. Open an issue on GitHub
