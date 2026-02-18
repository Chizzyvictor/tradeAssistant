# Quick Start Guide

Get started with the Trade Assistant Inventory Management System in just a few minutes!

## Installation

```bash
# Clone the repository
git clone https://github.com/Chizzyvictor/tradeAssistant.git
cd tradeAssistant

# Install dependencies
npm install
```

## Quick Demo

See the system in action with pre-populated data:

```bash
npm run demo
```

This will:
- Create 5 sample products across different categories
- Perform stock operations (add, remove, adjust)
- Display low stock and out-of-stock alerts
- Show transaction history
- Display inventory summary

## Interactive CLI

Launch the interactive command-line interface:

```bash
npm start
```

### Main Menu Options

1. **📦 View All Products** - See your entire inventory
2. **➕ Add New Product** - Create a new product
3. **✏️ Update Product** - Modify product details
4. **🗑️ Delete Product** - Remove a product
5. **📈 Add Stock** - Increase product quantity
6. **📉 Remove Stock** - Decrease product quantity (sales, etc.)
7. **🔧 Adjust Stock** - Set quantity to specific value
8. **⚠️ View Low Stock Products** - See items needing restocking
9. **🔍 Search Products** - Find products by name, SKU, or category
10. **📊 View Summary** - Overall inventory statistics
11. **📜 View Transactions** - Recent stock movements
12. **🌐 Start API Server** - Launch the REST API

## Using the REST API

### Start the API Server

From the CLI, select option 12, or run:

```bash
# The API server can be started from the CLI menu
npm start
# Then select "Start API Server" from the menu
```

### Test the API

Once the server is running (default port 3000):

```bash
# Health check
curl http://localhost:3000/health

# Get all products
curl http://localhost:3000/api/products

# Get inventory summary
curl http://localhost:3000/api/summary

# Search products
curl "http://localhost:3000/api/search?q=laptop"
```

For more API examples, see [API_EXAMPLES.md](./API_EXAMPLES.md)

## Common Tasks

### Add a New Product

**Via CLI:**
1. Run `npm start`
2. Select "Add New Product"
3. Fill in the required information

**Via API:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "sku": "SKU-001",
    "category": "Category",
    "price": 99.99,
    "quantity": 100,
    "minStockLevel": 10
  }'
```

### Check Low Stock Items

**Via CLI:**
1. Run `npm start`
2. Select "View Low Stock Products"

**Via API:**
```bash
curl "http://localhost:3000/api/products?status=low"
```

### Record a Sale (Remove Stock)

**Via CLI:**
1. Run `npm start`
2. Select "Remove Stock"
3. Choose the product
4. Enter quantity and reason

**Via API:**
```bash
curl -X POST http://localhost:3000/api/products/{id}/stock/remove \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5, "reason": "Sale", "reference": "INV-001"}'
```

### View Transaction History

**Via CLI:**
1. Run `npm start`
2. Select "View Transactions"

**Via API:**
```bash
curl http://localhost:3000/api/transactions
```

## Data Storage

All data is stored in JSON files in the `data/` directory:
- `data/products.json` - Product inventory
- `data/transactions.json` - Transaction history

**Note:** These files are automatically created when you first use the system.

## Running Tests

Verify everything is working correctly:

```bash
npm test
```

This runs the complete test suite including:
- Product model tests
- Transaction model tests
- Inventory service tests
- API endpoint tests

## Project Structure

```
tradeAssistant/
├── src/
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   ├── api/            # REST API
│   ├── cli/            # Interactive CLI
│   └── utils/          # Helper utilities
├── test/               # Test suite
├── data/               # JSON data files
├── demo.js             # Demo script
└── package.json        # Dependencies
```

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [API_EXAMPLES.md](./API_EXAMPLES.md) for API integration examples
- Explore the code in the `src/` directory
- Run `npm test` to see the test suite in action

## Tips

- Use meaningful SKUs for easy product identification
- Set appropriate minimum stock levels for alerts
- Use the reference field in transactions for purchase orders or invoices
- Regular inventory counts help maintain accuracy (use "Adjust Stock")
- The search function looks across name, SKU, description, and category

## Troubleshooting

**Port 3000 already in use:**
Set a different port: `PORT=3001 npm start`

**Data not persisting:**
Check that the `data/` directory has write permissions

**Tests failing:**
Make sure all dependencies are installed: `npm install`

## Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review test files in `test/` for usage examples
- Open an issue on GitHub for bugs or questions
