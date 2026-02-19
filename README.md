# Inventory Management System

A modern, full-featured inventory management system built with PHP, jQuery, and MySQL for tracking products and stock movements.

## Features

- **User Authentication**: Secure login system with password hashing
- **Dashboard**: Overview with key statistics and recent activities
- **Product Management**: Complete CRUD operations for products
- **Category Management**: Organize products into categories
- **Stock Movement Tracking**: Record and track all stock movements (in, out, adjustments)
- **Real-time Stock Updates**: Automatic stock level updates with movements
- **Low Stock Alerts**: Visual alerts for products below minimum stock levels
- **Responsive Design**: Modern UI with Bootstrap 5, works on all devices
- **Data Tables**: Sortable, searchable tables with pagination
- **Export Functionality**: Export data to CSV
- **Movement History**: Complete audit trail of all stock changes

## Technologies Used

- **Backend**: PHP 7.4+ with PDO
- **Frontend**: jQuery 3.6+, Bootstrap 5
- **Database**: MySQL 5.7+
- **Icons**: Font Awesome 6
- **Charts**: Chart.js (for future enhancements)
- **Tables**: DataTables plugin

## Installation

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- Modern web browser

### Setup Instructions

**Quick Start (Recommended):**
```bash
git clone https://github.com/Chizzyvictor/tradeAssistant.git
cd tradeAssistant
npm install
npm run demo
```

The demo server will guide you through the setup process and start a development server.

**Manual Setup:**

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/Chizzyvictor/tradeAssistant.git
   cd tradeAssistant
   ```

2. **Create Database**
   - Create a new MySQL database named `inventory_system`
   - Import the database schema:
   ```bash
   mysql -u root -p inventory_system < database.sql
   ```

3. **Configure Database Connection**
   - Open `config/database.php`
   - Update the database credentials:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   define('DB_NAME', 'inventory_system');
   ```

4. **Set Up Web Server**
   
   **Option A: PHP Built-in Server (Development)**
   ```bash
   php -S localhost:8000
   ```
   Then access: http://localhost:8000/login.php
   
   **Option B: Apache/Nginx (Production)**
   - Point your web server document root to the project directory
   - Ensure PHP has write permissions to the session directory
   
   **For Apache:**
   ```apache
   <VirtualHost *:80>
       ServerName inventory.local
       DocumentRoot /path/to/tradeAssistant
       <Directory /path/to/tradeAssistant>
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

5. **Access the Application**
   - Open your browser and navigate to `http://localhost:8000/login.php` (or your configured URL)
   - Login with default credentials:
     - **Username**: admin
     - **Password**: admin123

6. **Change Default Password** (Recommended)
   - After first login, change the default admin password for security

## Database Schema

### Tables

1. **users**: System users and authentication
2. **categories**: Product categories
3. **products**: Product information and current stock levels
4. **stock_movements**: Complete history of all stock changes

### Sample Data

The database comes pre-populated with:
- 1 admin user
- 4 sample categories
- 5 sample products

## Usage

### Managing Products

1. Navigate to **Products** from the main menu
2. Click **Add Product** to create new products
3. Fill in product details (name, SKU, price, category, etc.)
4. Set minimum stock level for low stock alerts
5. Edit or delete products as needed

### Recording Stock Movements

1. Navigate to **Stock Movements** from the main menu
2. Click **Record Movement**
3. Select the product and movement type:
   - **Stock In**: Receive new inventory
   - **Stock Out**: Issue/sell inventory
   - **Adjustment**: Correct stock levels
4. Enter quantity and optional reference number
5. Add notes if needed
6. The system automatically updates product stock levels

### Managing Categories

1. Navigate to **Categories** from the main menu
2. Click **Add Category** to create new categories
3. Assign products to categories for better organization

### Dashboard Features

- View total products and stock value
- Monitor low stock items
- See recent stock movements
- Quick access to all modules

## File Structure

```
tradeAssistant/
├── config/
│   ├── config.php          # Application configuration
│   └── database.php        # Database connection
├── includes/
│   ├── header.php          # Page header and navigation
│   └── footer.php          # Page footer and scripts
├── assets/
│   ├── css/
│   │   └── style.css       # Custom styles
│   └── js/
│       └── main.js         # JavaScript functionality
├── database.sql            # Database schema and sample data
├── index.php               # Dashboard
├── login.php               # Login page
├── logout.php              # Logout handler
├── products.php            # Product management
├── stock-movements.php     # Stock movement tracking
├── categories.php          # Category management
└── README.md               # This file
```

## Security Features

- Password hashing using PHP's `password_hash()`
- SQL injection prevention using prepared statements
- XSS protection with input sanitization
- Session-based authentication
- CSRF protection (recommended to add in production)

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## Troubleshooting

### Database Connection Error
- Verify database credentials in `config/database.php`
- Ensure MySQL service is running
- Check database exists and is accessible

### Session Errors
- Ensure PHP session directory is writable
- Check PHP session configuration

### Permission Errors
- Verify web server has appropriate file permissions
- Check PHP error logs for details

## Future Enhancements

- Multi-user roles and permissions
- Barcode scanning support
- Advanced reporting and analytics
- Email notifications for low stock
- Supplier management
- Purchase order management
- Mobile app integration
- Multi-warehouse support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available for educational and commercial use.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Credits

Developed by Chizzyvictor

## Changelog

### Version 1.0.0 (2026-02-18)
- Initial release
- Product management
- Stock movement tracking
- Category management
- User authentication
- Dashboard with statistics
- Responsive design
