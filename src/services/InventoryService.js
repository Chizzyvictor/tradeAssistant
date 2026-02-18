import { Product, StockTransaction } from '../models/index.js';
import { DataStore } from '../utils/index.js';

/**
 * InventoryService manages products and stock levels
 */
export class InventoryService {
  constructor() {
    this.productStore = new DataStore('products.json');
    this.transactionStore = new DataStore('transactions.json');
  }

  /**
   * Get all products
   */
  async getAllProducts() {
    const productsData = await this.productStore.read();
    return productsData.map((data) => new Product(data));
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const products = await this.getAllProducts();
    return products.find((p) => p.id === id);
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku) {
    const products = await this.getAllProducts();
    return products.find((p) => p.sku === sku);
  }

  /**
   * Add a new product
   */
  async addProduct(productData) {
    const product = new Product(productData);

    // Validate product
    const validation = product.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Check for duplicate SKU
    const existingProduct = await this.getProductBySku(product.sku);
    if (existingProduct) {
      throw new Error(`Product with SKU ${product.sku} already exists`);
    }

    // Save product
    const products = await this.getAllProducts();
    products.push(product);
    await this.productStore.write(products.map((p) => p.toJSON()));

    // Record initial stock transaction if quantity > 0
    if (product.quantity > 0) {
      await this.recordTransaction({
        productId: product.id,
        type: 'IN',
        quantity: product.quantity,
        previousQuantity: 0,
        newQuantity: product.quantity,
        reason: 'Initial stock',
        performedBy: 'system',
      });
    }

    return product;
  }

  /**
   * Update a product
   */
  async updateProduct(id, updates) {
    const products = await this.getAllProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const product = products[index];
    const oldQuantity = product.quantity;

    // Update product fields (except quantity, which is handled separately)
    Object.keys(updates).forEach((key) => {
      if (key !== 'quantity' && key !== 'id') {
        product[key] = updates[key];
      }
    });

    product.updatedAt = new Date().toISOString();

    // Validate updated product
    const validation = product.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Save updated products
    products[index] = product;
    await this.productStore.write(products.map((p) => p.toJSON()));

    // If quantity was updated, record transaction
    if (updates.quantity !== undefined && updates.quantity !== oldQuantity) {
      const diff = updates.quantity - oldQuantity;
      await this.recordTransaction({
        productId: product.id,
        type: diff > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(diff),
        previousQuantity: oldQuantity,
        newQuantity: updates.quantity,
        reason: 'Manual adjustment',
        performedBy: 'system',
      });
    }

    return product;
  }

  /**
   * Delete a product
   */
  async deleteProduct(id) {
    const products = await this.getAllProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    products.splice(index, 1);
    await this.productStore.write(products.map((p) => p.toJSON()));

    return true;
  }

  /**
   * Add stock to a product
   */
  async addStock(productId, quantity, reason = '', reference = '') {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const oldQuantity = product.quantity;
    const newQuantity = oldQuantity + quantity;

    product.updateQuantity(newQuantity);

    // Save updated product
    const products = await this.getAllProducts();
    const index = products.findIndex((p) => p.id === productId);
    products[index] = product;
    await this.productStore.write(products.map((p) => p.toJSON()));

    // Record transaction
    await this.recordTransaction({
      productId: product.id,
      type: 'IN',
      quantity,
      previousQuantity: oldQuantity,
      newQuantity,
      reason,
      reference,
      performedBy: 'system',
    });

    return product;
  }

  /**
   * Remove stock from a product
   */
  async removeStock(productId, quantity, reason = '', reference = '') {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (product.quantity < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`
      );
    }

    const oldQuantity = product.quantity;
    const newQuantity = oldQuantity - quantity;

    product.updateQuantity(newQuantity);

    // Save updated product
    const products = await this.getAllProducts();
    const index = products.findIndex((p) => p.id === productId);
    products[index] = product;
    await this.productStore.write(products.map((p) => p.toJSON()));

    // Record transaction
    await this.recordTransaction({
      productId: product.id,
      type: 'OUT',
      quantity,
      previousQuantity: oldQuantity,
      newQuantity,
      reason,
      reference,
      performedBy: 'system',
    });

    return product;
  }

  /**
   * Adjust stock to a specific quantity
   */
  async adjustStock(productId, newQuantity, reason = '') {
    if (newQuantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const oldQuantity = product.quantity;
    const diff = newQuantity - oldQuantity;

    if (diff === 0) {
      return product; // No change needed
    }

    product.updateQuantity(newQuantity);

    // Save updated product
    const products = await this.getAllProducts();
    const index = products.findIndex((p) => p.id === productId);
    products[index] = product;
    await this.productStore.write(products.map((p) => p.toJSON()));

    // Record transaction
    await this.recordTransaction({
      productId: product.id,
      type: 'ADJUSTMENT',
      quantity: Math.abs(diff),
      previousQuantity: oldQuantity,
      newQuantity,
      reason,
      performedBy: 'system',
    });

    return product;
  }

  /**
   * Get products with low stock
   */
  async getLowStockProducts() {
    const products = await this.getAllProducts();
    return products.filter((p) => p.isLowStock() && !p.isOutOfStock());
  }

  /**
   * Get products that are out of stock
   */
  async getOutOfStockProducts() {
    const products = await this.getAllProducts();
    return products.filter((p) => p.isOutOfStock());
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category) {
    const products = await this.getAllProducts();
    return products.filter((p) => p.category === category);
  }

  /**
   * Get all unique categories
   */
  async getCategories() {
    const products = await this.getAllProducts();
    const categories = new Set(products.map((p) => p.category));
    return Array.from(categories).sort();
  }

  /**
   * Record a stock transaction
   */
  async recordTransaction(transactionData) {
    const transaction = new StockTransaction(transactionData);

    // Validate transaction
    const validation = transaction.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Save transaction
    const transactions = await this.transactionStore.read();
    transactions.push(transaction.toJSON());
    await this.transactionStore.write(transactions);

    return transaction;
  }

  /**
   * Get all transactions
   */
  async getAllTransactions() {
    const transactionsData = await this.transactionStore.read();
    return transactionsData.map((data) => new StockTransaction(data));
  }

  /**
   * Get transactions for a specific product
   */
  async getProductTransactions(productId) {
    const transactions = await this.getAllTransactions();
    return transactions.filter((t) => t.productId === productId);
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary() {
    const products = await this.getAllProducts();
    const transactions = await this.getAllTransactions();

    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const lowStockCount = products.filter((p) => p.isLowStock()).length;
    const outOfStockCount = products.filter((p) => p.isOutOfStock()).length;
    const categories = await this.getCategories();

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      totalCategories: categories.length,
      totalTransactions: transactions.length,
      categories,
    };
  }

  /**
   * Search products
   */
  async searchProducts(query) {
    const products = await this.getAllProducts();
    const lowerQuery = query.toLowerCase();

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
  }
}
