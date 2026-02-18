# API Usage Examples

This document provides examples of how to use the Trade Assistant Inventory Management API.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. This should be added in production environments.

## Endpoints

### Products

#### Get All Products

```bash
curl http://localhost:3000/api/products
```

Response:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "abc123",
      "name": "Dell Laptop XPS 15",
      "sku": "LAP-XPS-001",
      "category": "Electronics",
      "price": 1299.99,
      "quantity": 35,
      "stockStatus": "IN_STOCK"
    }
  ]
}
```

#### Filter by Category

```bash
curl "http://localhost:3000/api/products?category=Electronics"
```

#### Filter by Stock Status

```bash
# Get low stock products
curl "http://localhost:3000/api/products?status=low"

# Get out of stock products
curl "http://localhost:3000/api/products?status=out"
```

#### Get Product by ID

```bash
curl http://localhost:3000/api/products/{productId}
```

#### Create Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "sku": "PHN-IPH-001",
    "description": "Latest Apple iPhone",
    "category": "Electronics",
    "price": 999.99,
    "quantity": 50,
    "minStockLevel": 10,
    "unit": "pcs",
    "supplier": "Apple Inc."
  }'
```

#### Update Product

```bash
curl -X PUT http://localhost:3000/api/products/{productId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max",
    "price": 1199.99,
    "minStockLevel": 15
  }'
```

#### Delete Product

```bash
curl -X DELETE http://localhost:3000/api/products/{productId}
```

### Stock Management

#### Add Stock

```bash
curl -X POST http://localhost:3000/api/products/{productId}/stock/add \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 25,
    "reason": "New shipment received",
    "reference": "PO-2024-001"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "Dell Laptop XPS 15",
    "quantity": 60,
    "stockStatus": "IN_STOCK"
  }
}
```

#### Remove Stock

```bash
curl -X POST http://localhost:3000/api/products/{productId}/stock/remove \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10,
    "reason": "Sale to customer",
    "reference": "INV-2024-100"
  }'
```

#### Adjust Stock

```bash
curl -X POST http://localhost:3000/api/products/{productId}/stock/adjust \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 50,
    "reason": "Physical inventory count"
  }'
```

### Transactions

#### Get All Transactions

```bash
curl http://localhost:3000/api/transactions
```

Response:
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "txn123",
      "productId": "abc123",
      "type": "IN",
      "quantity": 25,
      "previousQuantity": 35,
      "newQuantity": 60,
      "reason": "New shipment received",
      "reference": "PO-2024-001",
      "timestamp": "2024-02-18T10:30:00Z"
    }
  ]
}
```

#### Get Product Transaction History

```bash
curl http://localhost:3000/api/products/{productId}/transactions
```

### Reports

#### Get Inventory Summary

```bash
curl http://localhost:3000/api/summary
```

Response:
```json
{
  "success": true,
  "data": {
    "totalProducts": 25,
    "totalValue": 75432.50,
    "lowStockCount": 3,
    "outOfStockCount": 1,
    "totalCategories": 5,
    "totalTransactions": 150,
    "categories": ["Electronics", "Furniture", "Stationery"]
  }
}
```

#### Get All Categories

```bash
curl http://localhost:3000/api/categories
```

#### Search Products

```bash
curl "http://localhost:3000/api/search?q=laptop"
```

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "abc123",
      "name": "Dell Laptop XPS 15",
      "sku": "LAP-XPS-001"
    }
  ]
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Transaction Types

- `IN` - Stock added to inventory
- `OUT` - Stock removed from inventory
- `ADJUSTMENT` - Stock quantity adjusted (could be up or down)
- `RETURN` - Stock returned to inventory

## Stock Status Values

- `IN_STOCK` - Sufficient stock available
- `LOW_STOCK` - Stock level at or below minimum threshold
- `OUT_OF_STOCK` - No stock available

## Integration Example (JavaScript/Node.js)

```javascript
const API_BASE = 'http://localhost:3000/api';

// Get all products
async function getProducts() {
  const response = await fetch(`${API_BASE}/products`);
  const data = await response.json();
  return data.data;
}

// Create a new product
async function createProduct(productData) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  const data = await response.json();
  return data.data;
}

// Add stock
async function addStock(productId, quantity, reason) {
  const response = await fetch(`${API_BASE}/products/${productId}/stock/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity, reason }),
  });
  const data = await response.json();
  return data.data;
}

// Get inventory summary
async function getSummary() {
  const response = await fetch(`${API_BASE}/summary`);
  const data = await response.json();
  return data.data;
}
```

## Python Integration Example

```python
import requests

API_BASE = 'http://localhost:3000/api'

# Get all products
def get_products():
    response = requests.get(f'{API_BASE}/products')
    return response.json()['data']

# Create a product
def create_product(product_data):
    response = requests.post(
        f'{API_BASE}/products',
        json=product_data
    )
    return response.json()['data']

# Add stock
def add_stock(product_id, quantity, reason):
    response = requests.post(
        f'{API_BASE}/products/{product_id}/stock/add',
        json={'quantity': quantity, 'reason': reason}
    )
    return response.json()['data']
```
