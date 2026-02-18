import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { InventoryService } from '../src/services/InventoryService.js';
import { DataStore } from '../src/utils/dataStore.js';

describe('InventoryService', () => {
  let service;
  const testProductData = {
    name: 'Test Product',
    sku: 'TEST-SKU-001',
    price: 29.99,
    quantity: 100,
    minStockLevel: 20,
    category: 'Test Category',
  };

  beforeEach(async () => {
    service = new InventoryService();
    // Clear test data
    await service.productStore.clear();
    await service.transactionStore.clear();
  });

  afterEach(async () => {
    // Clean up test data
    await service.productStore.clear();
    await service.transactionStore.clear();
  });

  describe('Product Management', () => {
    it('should add a new product', async () => {
      const product = await service.addProduct(testProductData);
      assert.strictEqual(product.name, testProductData.name);
      assert.strictEqual(product.sku, testProductData.sku);
      assert.ok(product.id);
    });

    it('should prevent duplicate SKU', async () => {
      await service.addProduct(testProductData);
      await assert.rejects(
        async () => await service.addProduct(testProductData),
        /already exists/
      );
    });

    it('should get all products', async () => {
      await service.addProduct(testProductData);
      await service.addProduct({
        ...testProductData,
        sku: 'TEST-SKU-002',
        name: 'Second Product',
      });

      const products = await service.getAllProducts();
      assert.strictEqual(products.length, 2);
    });

    it('should get product by ID', async () => {
      const addedProduct = await service.addProduct(testProductData);
      const foundProduct = await service.getProductById(addedProduct.id);
      assert.strictEqual(foundProduct.id, addedProduct.id);
      assert.strictEqual(foundProduct.name, testProductData.name);
    });

    it('should get product by SKU', async () => {
      await service.addProduct(testProductData);
      const product = await service.getProductBySku(testProductData.sku);
      assert.strictEqual(product.sku, testProductData.sku);
    });

    it('should update product', async () => {
      const product = await service.addProduct(testProductData);
      const updates = { name: 'Updated Name', price: 39.99 };
      const updated = await service.updateProduct(product.id, updates);

      assert.strictEqual(updated.name, 'Updated Name');
      assert.strictEqual(updated.price, 39.99);
    });

    it('should delete product', async () => {
      const product = await service.addProduct(testProductData);
      await service.deleteProduct(product.id);

      const products = await service.getAllProducts();
      assert.strictEqual(products.length, 0);
    });
  });

  describe('Stock Management', () => {
    it('should add stock to product', async () => {
      const product = await service.addProduct(testProductData);
      const updated = await service.addStock(product.id, 50, 'Restocking');

      assert.strictEqual(updated.quantity, 150); // 100 + 50
    });

    it('should remove stock from product', async () => {
      const product = await service.addProduct(testProductData);
      const updated = await service.removeStock(product.id, 30, 'Sale');

      assert.strictEqual(updated.quantity, 70); // 100 - 30
    });

    it('should prevent removing more stock than available', async () => {
      const product = await service.addProduct(testProductData);
      await assert.rejects(
        async () => await service.removeStock(product.id, 150),
        /Insufficient stock/
      );
    });

    it('should adjust stock to specific quantity', async () => {
      const product = await service.addProduct(testProductData);
      const updated = await service.adjustStock(
        product.id,
        75,
        'Inventory count'
      );

      assert.strictEqual(updated.quantity, 75);
    });

    it('should record transaction when adding stock', async () => {
      const product = await service.addProduct(testProductData);
      await service.addStock(product.id, 50);

      const transactions = await service.getProductTransactions(product.id);
      // Should have initial stock + add stock transactions
      assert.ok(transactions.length >= 2);
      const addTransaction = transactions.find((t) => t.quantity === 50);
      assert.strictEqual(addTransaction.type, 'IN');
    });

    it('should record transaction when removing stock', async () => {
      const product = await service.addProduct(testProductData);
      await service.removeStock(product.id, 30);

      const transactions = await service.getProductTransactions(product.id);
      const removeTransaction = transactions.find((t) => t.quantity === 30);
      assert.strictEqual(removeTransaction.type, 'OUT');
    });
  });

  describe('Stock Alerts', () => {
    it('should identify low stock products', async () => {
      await service.addProduct({
        ...testProductData,
        quantity: 15,
        minStockLevel: 20,
      });

      const lowStock = await service.getLowStockProducts();
      assert.strictEqual(lowStock.length, 1);
    });

    it('should identify out of stock products', async () => {
      await service.addProduct({
        ...testProductData,
        quantity: 0,
      });

      const outOfStock = await service.getOutOfStockProducts();
      assert.strictEqual(outOfStock.length, 1);
    });
  });

  describe('Categories', () => {
    it('should get products by category', async () => {
      await service.addProduct({ ...testProductData, category: 'Electronics' });
      await service.addProduct({
        ...testProductData,
        sku: 'TEST-SKU-002',
        category: 'Electronics',
      });
      await service.addProduct({
        ...testProductData,
        sku: 'TEST-SKU-003',
        category: 'Books',
      });

      const electronics = await service.getProductsByCategory('Electronics');
      assert.strictEqual(electronics.length, 2);
    });

    it('should get all categories', async () => {
      await service.addProduct({ ...testProductData, category: 'Electronics' });
      await service.addProduct({
        ...testProductData,
        sku: 'TEST-SKU-002',
        category: 'Books',
      });

      const categories = await service.getCategories();
      assert.strictEqual(categories.length, 2);
      assert.ok(categories.includes('Electronics'));
      assert.ok(categories.includes('Books'));
    });
  });

  describe('Search and Reports', () => {
    it('should search products', async () => {
      await service.addProduct(testProductData);
      await service.addProduct({
        ...testProductData,
        sku: 'TEST-SKU-002',
        name: 'Another Product',
      });

      const results = await service.searchProducts('Test');
      assert.strictEqual(results.length, 2);
    });

    it('should get inventory summary', async () => {
      await service.addProduct(testProductData);
      await service.addProduct({
        ...testProductData,
        sku: 'TEST-SKU-002',
        quantity: 0,
      });

      const summary = await service.getInventorySummary();
      assert.strictEqual(summary.totalProducts, 2);
      assert.strictEqual(summary.outOfStockCount, 1);
      assert.ok(summary.totalValue > 0);
    });
  });
});
