import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { Product } from '../src/models/Product.js';

describe('Product Model', () => {
  let product;

  before(() => {
    product = new Product({
      name: 'Test Product',
      sku: 'TEST-001',
      price: 99.99,
      quantity: 50,
      minStockLevel: 10,
      category: 'Electronics',
    });
  });

  it('should create a product with all properties', () => {
    assert.strictEqual(product.name, 'Test Product');
    assert.strictEqual(product.sku, 'TEST-001');
    assert.strictEqual(product.price, 99.99);
    assert.strictEqual(product.quantity, 50);
    assert.strictEqual(product.minStockLevel, 10);
    assert.strictEqual(product.category, 'Electronics');
    assert.ok(product.id);
  });

  it('should validate valid product data', () => {
    const validation = product.validate();
    assert.strictEqual(validation.isValid, true);
    assert.strictEqual(validation.errors.length, 0);
  });

  it('should reject product without name', () => {
    const invalidProduct = new Product({
      name: '',
      sku: 'TEST-002',
      price: 10,
    });
    const validation = invalidProduct.validate();
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.errors.some((e) => e.includes('name')));
  });

  it('should reject product without SKU', () => {
    const invalidProduct = new Product({
      name: 'Test',
      sku: '',
      price: 10,
    });
    const validation = invalidProduct.validate();
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.errors.some((e) => e.includes('SKU')));
  });

  it('should reject product with negative price', () => {
    const invalidProduct = new Product({
      name: 'Test',
      sku: 'TEST-003',
      price: -10,
    });
    const validation = invalidProduct.validate();
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.errors.some((e) => e.includes('Price')));
  });

  it('should detect low stock correctly', () => {
    const lowStockProduct = new Product({
      name: 'Test',
      sku: 'TEST-004',
      price: 10,
      quantity: 10,
      minStockLevel: 10,
    });
    assert.strictEqual(lowStockProduct.isLowStock(), true);
  });

  it('should detect out of stock correctly', () => {
    const outOfStockProduct = new Product({
      name: 'Test',
      sku: 'TEST-005',
      price: 10,
      quantity: 0,
    });
    assert.strictEqual(outOfStockProduct.isOutOfStock(), true);
  });

  it('should get correct stock status for in-stock product', () => {
    assert.strictEqual(product.getStockStatus(), 'IN_STOCK');
  });

  it('should get correct stock status for low-stock product', () => {
    const lowStockProduct = new Product({
      name: 'Test',
      sku: 'TEST-006',
      price: 10,
      quantity: 5,
      minStockLevel: 10,
    });
    assert.strictEqual(lowStockProduct.getStockStatus(), 'LOW_STOCK');
  });

  it('should get correct stock status for out-of-stock product', () => {
    const outOfStockProduct = new Product({
      name: 'Test',
      sku: 'TEST-007',
      price: 10,
      quantity: 0,
    });
    assert.strictEqual(outOfStockProduct.getStockStatus(), 'OUT_OF_STOCK');
  });

  it('should update quantity correctly', () => {
    const newQuantity = 100;
    product.updateQuantity(newQuantity);
    assert.strictEqual(product.quantity, newQuantity);
  });

  it('should convert to JSON correctly', () => {
    const json = product.toJSON();
    assert.strictEqual(json.name, product.name);
    assert.strictEqual(json.sku, product.sku);
    assert.strictEqual(json.price, product.price);
    assert.strictEqual(json.quantity, product.quantity);
    assert.ok(json.stockStatus);
  });
});
