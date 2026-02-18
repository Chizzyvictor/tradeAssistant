# Trade Assistant - Modern Inventory Management System

A comprehensive, modern inventory management system with stock tracking features designed for efficient company inventory management.

## Features

### Core Functionality
- ✅ **Product Management**: Add, update, delete, and view products
- 📊 **Stock Tracking**: Real-time stock level monitoring with transaction history
- ⚠️ **Low Stock Alerts**: Automatic detection of low stock and out-of-stock items
- 📈 **Stock Operations**: Add, remove, and adjust inventory quantities
- 🏷️ **Category Management**: Organize products by categories
- 🔍 **Search & Filter**: Powerful search across all product fields
- 📜 **Transaction History**: Complete audit trail of all stock movements
- 📊 **Inventory Reports**: Comprehensive summary and analytics

### Interfaces
- 💻 **Interactive CLI**: User-friendly command-line interface with menus
- 🌐 **REST API**: Full-featured API for integration with other systems
- 📦 **JSON Storage**: Simple, file-based data persistence

## Installation

### Prerequisites
- Node.js >= 18.0.0
- npm (comes with Node.js)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Chizzyvictor/tradeAssistant.git
cd tradeAssistant
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Interactive CLI Mode

Start the interactive command-line interface:

```bash
npm start
```

The CLI provides a menu-driven interface with the following options:
- View all products
- Add new product
- Update product details
- Delete product
- Add stock (stock in)
- Remove stock (stock out)
- Adjust stock (set to specific quantity)
- View low stock alerts
- Search products
- View inventory summary
- View transaction history
- Start REST API server

### REST API Mode

The system includes a comprehensive REST API for integration with other applications.

#### Start the API Server

From the CLI menu, select "Start API Server", or programmatically:

```javascript
import { startServer } from './src/api/server.js';
await startServer();
```

The API server runs on port 3000 by default (configurable via PORT environment variable).

#### API Endpoints

**Products**

- `GET /api/products` - Get all products
  - Query params: `category`, `status` (low, out)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**Stock Management**

- `POST /api/products/:id/stock/add` - Add stock
  - Body: `{ quantity, reason, reference }`
- `POST /api/products/:id/stock/remove` - Remove stock
  - Body: `{ quantity, reason, reference }`
- `POST /api/products/:id/stock/adjust` - Adjust stock
  - Body: `{ quantity, reason }`

**Transactions & Reports**

- `GET /api/products/:id/transactions` - Get product transaction history
- `GET /api/transactions` - Get all transactions
- `GET /api/categories` - Get all categories
- `GET /api/summary` - Get inventory summary
- `GET /api/search?q=query` - Search products

**Health Check**

- `GET /health` - API health check

#### API Examples

Create a new product:
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "sku": "LAP-001",
    "description": "15-inch laptop",
    "category": "Electronics",
    "price": 999.99,
    "quantity": 50,
    "minStockLevel": 10,
    "unit": "pcs",
    "supplier": "Tech Supplier Inc"
  }'
```

Add stock:
```bash
curl -X POST http://localhost:3000/api/products/{productId}/stock/add \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 25,
    "reason": "New shipment",
    "reference": "PO-12345"
  }'
```

Search products:
```bash
curl http://localhost:3000/api/search?q=laptop
```

## Data Model

### Product
- `id`: Unique identifier (UUID)
- `name`: Product name
- `sku`: Stock Keeping Unit (unique)
- `description`: Product description
- `category`: Product category
- `price`: Unit price
- `quantity`: Current stock quantity
- `minStockLevel`: Minimum stock level for alerts
- `unit`: Unit of measurement (pcs, kg, etc.)
- `supplier`: Supplier information
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Stock Transaction
- `id`: Unique identifier (UUID)
- `productId`: Associated product ID
- `type`: Transaction type (IN, OUT, ADJUSTMENT, RETURN)
- `quantity`: Quantity changed
- `previousQuantity`: Stock before transaction
- `newQuantity`: Stock after transaction
- `reason`: Transaction reason
- `reference`: Reference number (PO, invoice, etc.)
- `performedBy`: User who performed the action
- `timestamp`: Transaction timestamp

## Stock Status Indicators

- **IN_STOCK**: Quantity > minimum stock level
- **LOW_STOCK**: Quantity ≤ minimum stock level (but > 0)
- **OUT_OF_STOCK**: Quantity = 0

## Development

### Run Tests

```bash
npm test
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
tradeAssistant/
├── src/
│   ├── models/          # Data models (Product, Transaction)
│   ├── services/        # Business logic (InventoryService)
│   ├── api/            # REST API routes and server
│   ├── cli/            # Command-line interface
│   ├── utils/          # Utilities (DataStore)
│   └── index.js        # Main entry point
├── test/               # Test files
├── data/               # JSON data storage
└── package.json        # Dependencies and scripts
```

## Technology Stack

- **Runtime**: Node.js (ES Modules)
- **CLI Framework**: Inquirer.js
- **API Framework**: Express.js
- **Data Storage**: JSON files
- **Testing**: Node.js built-in test runner
- **Code Quality**: ESLint, Prettier

## Features Highlights

### Transaction Tracking
Every stock movement is automatically recorded with:
- Transaction type (stock in, out, adjustment, return)
- Quantity change
- Before/after quantities
- Reason and reference
- Timestamp and user

### Low Stock Management
The system automatically monitors stock levels and alerts when:
- Products reach their minimum stock level
- Products are out of stock

### Comprehensive Validation
All data is validated before storage:
- Required fields
- Data types
- Business rules (no negative quantities, etc.)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
